import { withPluginApi } from "discourse/lib/plugin-api";
import { observes } from "discourse-common/utils/decorators";
import User from "discourse/models/user";

export default {
  name: "discourse-featured-tiles",

  initialize() {
    withPluginApi("0.8.9", api => {
      api.modifyClass("controller:preferences/interface", {
        @observes("model.id")
        updateShowFeaturedTopicsBanner() {
          // debugger;
          if (this.model.id !== User.current().id) return;
          this.set(
            "model.show_featured_topics_banner",
            this.storedFeaturedTopicsValue()
          );
        },

        storedFeaturedTopicsValue() {
          let val = window.localStorage.getItem("show_featured_topics_banner");
          if (val === "false") val = false;
          if (val === null) val = true;
          return !!val;
        },

        actions: {
          save() {
            this._super();
            debugger;
            if (this.model.id !== User.current().id) return;
            if (
              this.storedFeaturedTopicsValue() !==
              this.model.show_featured_topics_banner
            ) {
              if (this.model.show_featured_topics_banner) {
                window.localStorage.removeItem("show_featured_topics_banner");
              } else {
                window.localStorage.setItem(
                  "show_featured_topics_banner",
                  false
                );
              }
            }
          }
        }
      });
    });
  }
};
