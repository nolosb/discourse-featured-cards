export default {
  setupComponent(args, component) {
    if (settings.plugin_outlet == "discovery-list-container-top") {
      this.set("discoveryList", true);
    } else {
      this.set("discoveryList", false);
    }
  },
};
