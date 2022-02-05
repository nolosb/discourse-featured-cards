import discourseComputed from "discourse-common/utils/decorators";
import { observes } from "discourse-common/utils/decorators";
import Component from "@ember/component";
import { next } from "@ember/runloop";
import { inject as service } from "@ember/service";
import { defaultHomepage } from "discourse/lib/utilities";

const featuredTags = settings.featured_tags.replaceAll("|", " ");

function shuffle(array) {
  array = [...array];

  // https://stackoverflow.com/a/12646864
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }

  return array;
}

export default Component.extend({
  router: service("router"),
  isLoading: true,
  classNameBindings: "isLoading",
  pos: { top: 0, left: 0, x: 0, y: 0 },

  init() {
    this._super();
    this.set("isLoading", true);
    this.loadTopics();
  },

  didRender() {
    this.container = this.element.querySelector(".featured-cards-container");
  },

  @observes("category")
  categoryChanged() {
    if (settings.scope_to_category) {
      this.loadTopics();
    }
  },

  loadTopics() {
    const loadParams = { tags: featuredTags, period: settings.top_period };
    if (settings.featured_category > 0) {
      loadParams.category = settings.featured_category;
    }

    this.store
      .findFiltered("topicList", {
        filter: settings.topic_source,
        params: loadParams,
      })
      .then((list) => {
        this.set("list", list);
        next(this, () => this.set("isLoading", false)); // Use `next` for CSS animation
      });
  },

  @discourseComputed("list.topics")
  filteredTopics(topics) {
    if (!topics) return;
    if (settings.randomize_topics) {
      topics = shuffle(topics);
    }
    return topics.slice(0, settings.maximum_topic_count);
  },

  @discourseComputed("site.mobileView", "router.currentRoute", "router.currentRouteName")
  shouldDisplay(isMobile, currentRoute, currentRouteName) {
    if (isMobile && !settings.display_mobile) return false;
    if (currentRoute) {
      if (settings.show_on === "homepage") {
        return currentRouteName == `discovery.${defaultHomepage()}`;
      } else if (settings.show_on === "top_menu") {
        const topMenuRoutes = this.siteSettings.top_menu
          .split("|")
          .filter(Boolean);
        return topMenuRoutes.includes(currentRoute.localName);
      } else if (settings.show_on === "all") {
        return (
          currentRouteName.indexOf("editCategory") &&
          currentRouteName.indexOf("admin") &&
          currentRouteName.indexOf("full-page-search")
        );
      } else {
        return false;
      }
    }
  },

  @discourseComputed()
  showHeading() {
    if (settings.show_component_heading) {
      const titleElement = document.createElement("h3");
      titleElement.innerHTML = settings.heading_text;
      return titleElement;
    }
  },
});
