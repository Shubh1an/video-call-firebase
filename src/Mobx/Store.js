import { action, makeAutoObservable } from "mobx";
class CallStore {
  initialState = {
    isLoggedIn: false,
    userData: {},
  };
  constructor(initialState) {
    makeAutoObservable(this, {
      login: action,
    });
  }
  login(state) {
    this.initialState.isLoggedIn = state.isLoggedIn;
    this.initialState.userData = { ...state.data };
  }
  logout() {
    this.initialState.isLoggedIn = false;
    this.initialState.userData = {};
  }
}
export const UserStore = new CallStore();
