import discourseComputed from "discourse-common/utils/decorators";
import { observes } from "discourse-common/utils/decorators";
import Component from "@ember/component";
import { next } from "@ember/runloop";

const displayCategories = settings.display_categories
  .split("|")
  .map((id) => parseInt(id, 10))
  .filter((id) => id);

const featuredTags = settings.featured_tags.split("|");

export default Component.extend({
  isLoading: true,
  classNameBindings: "isLoading",

  init() {
    this._super();
    this.set("isLoading", true);
    this.loadTopics();
  },

  @observes("category")
  categoryChanged() {
    if (settings.scope_to_category) {
      this.loadTopics();
    }
  },

  loadTopics() {
    const loadParams = { tags: featuredTags };
    if (settings.scope_to_category && this.category) {
      loadParams.category = this.category.id;
    }

    this.store
      .findFiltered("topicList", {
        filter: "latest",
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
    return topics.slice(0, settings.maximum_topic_count);
  },

  @discourseComputed("site.mobileView", "category.id")
  shouldDisplay(isMobile, viewingCategoryId) {
    if (isMobile && !settings.display_mobile) return false;
    if (displayCategories.length === 0) return true;
    return displayCategories.includes(viewingCategoryId);
  },
});
