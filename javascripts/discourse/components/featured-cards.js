import discourseComputed from "discourse-common/utils/decorators";
import { observes } from "discourse-common/utils/decorators";
import Component from "@ember/component";
import { next } from "@ember/runloop";
import { inject as service } from "@ember/service";
import { action } from "@ember/object";

const displayCategories = settings.display_categories
  .split("|")
  .map((id) => parseInt(id, 10))
  .filter((id) => id);

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

  @action
  mouseMoveHandler(e) {
    if (!this.listen) return;

    const dx = e.clientX - this.pos.x;
    const dy = e.clientY - this.pos.y;

    // Scroll the element
    this.container.scrollTop = this.pos.top - dy;
    this.container.scrollLeft = this.pos.left - dx;
  },

  mouseDown(e) {
    this.pos = {
      // The current scroll
      left: this.container.scrollLeft,
      top: this.container.scrollTop,
      // Get the current mouse position
      x: e.clientX,
      y: e.clientY,
    };

    this.set("listen", true);
  },

  mouseUp(e) {
    this.set("listen", false);

    this.container.style.cursor = "grab";
    this.container.style.removeProperty("user-select");
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

    if (settings.scope_to_category && this.category) {
      loadParams.category = this.category.id;
    }

    console.log(settings.topic_source)
    console.log(loadParams)

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
    let filteredTopics = topics.filter((topic) => topic.tags && settings.featured_tags.split("|").some(tag=> topic.tags.includes(tag)));

    if (settings.randomize_topics) {
      filteredTopics = shuffle(filteredTopics);
    }

    return filteredTopics.slice(0, settings.maximum_topic_count);
  },

  @discourseComputed(
    "site.mobileView",
    "category.id",
    "router.currentRouteName"
  )
  shouldDisplay(isMobile, viewingCategoryId, currentRouteName) {
    if (
      ![
        "discovery.latest",
        "discovery.top",
        "discovery.categories",
        "discovery.latestCategory",
      ].includes(currentRouteName)
    ) {
      return false;
    }

    if (isMobile && !settings.display_mobile) return false;
    if (settings.display_when_unfiltered && !viewingCategoryId) return true;

    if (settings.display_on_categories && viewingCategoryId) {
      if (displayCategories.length === 0) return true;
      return displayCategories.includes(viewingCategoryId);
    }
    return false;
  },
});
