export default {
  shouldRender() {
    let val = window.localStorage.getItem("show_featured_topics_banner");
    if (val === "false") val = false;
    if (val === null) val = true;
    return val;
  }
};
