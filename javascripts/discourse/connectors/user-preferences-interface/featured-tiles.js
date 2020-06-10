import User from "discourse/models/user";

export default {
  shouldRender(component) {
    return component.model.id === User.current().id;
  }
};
