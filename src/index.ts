import habitat from "preact-habitat";

import Widget from "./components/hello-world";

const _habitat = habitat(Widget);

_habitat.render({
  selector: '[data-widget-host="habitat"]',
  clean: true
});
