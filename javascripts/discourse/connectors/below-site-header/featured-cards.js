export default {
  setupComponent(args, component) {
    if (settings.plugin_outlet == "below-site-header") {
      this.set("belowHeader", true);
    } else {
      this.set("belowHeader", false);
    }
  },
};
