import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import { MockLink } from "apollo-link-mock";
import { GraphQLRequest } from "apollo-link";
import Enzyme, { mount } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import gql from "graphql-tag";
import React from "react";
import { ApolloProvider } from "react-apollo-hooks";
import { BrowserRouter as Router } from "react-router-dom";
import { MockedProvider } from "@apollo/react-testing";
import Login from "../Login";

Enzyme.configure({ adapter: new Adapter() });

const loggedUserQuery = gql`
  {
    loggedUser {
      id
    }
  }
`;

const loginMutation = gql`
  mutation login($loginid: String!, $password: String!) {
    login(input: { loginid: $loginid, password: $password }) {
      user {
        accessToken {
          token
        }
      }
      result
    }
  }
`;

type MockType = {
  request: {
    query: GraphQLRequest;
    variables?: { loginid: string; password: string };
  };
  result: { data: any };
};

const successMocks: MockType[] = [
  {
    request: { query: loggedUserQuery },
    result: { data: { loggedUser: null } }
  },
  {
    request: {
      query: loginMutation,
      variables: { loginid: "loginid", password: "password" }
    },
    result: {
      data: {
        login: { result: true, user: { accessToken: { token: "token" } } }
      }
    }
  }
];

const errorMocks: MockType[] = [
  {
    request: { query: loggedUserQuery },
    result: { data: { loggedUser: null } }
  },
  {
    request: {
      query: loginMutation,
      variables: { loginid: "loginid", password: "password" }
    },
    result: {
      data: {
        login: { result: false, user: { accessToken: null } }
      }
    }
  }
];

const loggedInMocks: MockType[] = [
  {
    request: { query: loggedUserQuery },
    result: { data: { loggedUser: { id: "1" } } }
  }
];

const setup = (mocks = successMocks) => {
  const client = new ApolloClient({
    cache: new InMemoryCache({ addTypename: false }),
    link: new MockLink(mocks)
  });

  const enzymeWrapper = mount(
    <MockedProvider mocks={mocks} addTypename={false}>
      <ApolloProvider client={client}>
        <Router>
          <Login />
        </Router>
      </ApolloProvider>
    </MockedProvider>
  );

  return {
    enzymeWrapper
  };
};

describe("Login", () => {
  it("ローディングメッセージが表示されること", () => {
    const { enzymeWrapper } = setup();
    expect(enzymeWrapper.find("Login div").text()).toEqual("Now Loading...");
  });

  describe("ログインしていない場合", () => {
    it("フォームが表示されること", async () => {
      const { enzymeWrapper } = setup();
      await new Promise(resolve => setTimeout(resolve));
      enzymeWrapper.update();
      expect(enzymeWrapper.find("Login input[type='text']").exists()).toEqual(
        true
      );
      expect(
        enzymeWrapper.find("Login input[type='password']").exists()
      ).toEqual(true);
      expect(enzymeWrapper.find("Login input[type='submit']").exists()).toEqual(
        true
      );
    });

    describe("ログインIDを入力した場合", () => {
      it("テキストフィールドの値が更新されること", async () => {
        const { enzymeWrapper } = setup();
        await new Promise(resolve => setTimeout(resolve));
        enzymeWrapper.update();
        expect(
          enzymeWrapper.find("Login input[type='text']").prop("value")
        ).toEqual("");
        enzymeWrapper
          .find("Login input[type='text']")
          .simulate("change", { target: { value: "loginid" } });
        expect(
          enzymeWrapper.find("Login input[type='text']").prop("value")
        ).toEqual("loginid");
      });
    });

    describe("パスワードを入力した場合", () => {
      it("パスワードフィールドの値が更新されること", async () => {
        const { enzymeWrapper } = setup();
        await new Promise(resolve => setTimeout(resolve));
        enzymeWrapper.update();
        expect(
          enzymeWrapper.find("Login input[type='password']").prop("value")
        ).toEqual("");
        enzymeWrapper
          .find("Login input[type='password']")
          .simulate("change", { target: { value: "password" } });
        expect(
          enzymeWrapper.find("Login input[type='password']").prop("value")
        ).toEqual("password");
      });
    });

    describe("ログイン処理を実行", () => {
      describe("ログインに成功した場合", () => {
        it("ルートにリダイレクトされる", async () => {
          const { enzymeWrapper } = setup();
          await new Promise(resolve => setTimeout(resolve));
          enzymeWrapper.update();
          enzymeWrapper
            .find("Login input[type='text']")
            .simulate("change", { target: { value: "loginid" } });
          enzymeWrapper
            .find("Login input[type='password']")
            .simulate("change", { target: { value: "password" } });
          enzymeWrapper.find("Login input[type='submit']").simulate("click");
          await new Promise(resolve => setTimeout(resolve));
          enzymeWrapper.update();
          const history: any = enzymeWrapper.find("Login").prop("history");
          expect(history.length).toEqual(2);
          expect(history.action).toEqual("PUSH");
          expect(history.location.pathname).toEqual("/");
        });
      });

      describe("ログインに失敗した場合", () => {
        it("入力内容が空になる", async () => {
          const { enzymeWrapper } = setup(errorMocks);
          await new Promise(resolve => setTimeout(resolve));
          enzymeWrapper.update();
          enzymeWrapper
            .find("Login input[type='text']")
            .simulate("change", { target: { value: "loginid" } });
          enzymeWrapper
            .find("Login input[type='password']")
            .simulate("change", { target: { value: "password" } });
          enzymeWrapper.find("Login input[type='submit']").simulate("click");
          await new Promise(resolve => setTimeout(resolve));
          enzymeWrapper.update();
          expect(
            enzymeWrapper.find("Login input[type='text']").prop("value")
          ).toEqual("");
          expect(
            enzymeWrapper.find("Login input[type='password']").prop("value")
          ).toEqual("");
        });
      });
    });
  });

  describe("ログイン済みの場合", () => {
    it("ルートにリダイレクトされる", async () => {
      const { enzymeWrapper } = setup(loggedInMocks);
      await new Promise(resolve => setTimeout(resolve));
      enzymeWrapper.update();
      expect(enzymeWrapper.find("Login Redirect").exists()).toEqual(true);
    });
  });
});
