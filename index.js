import TWEEN from "./tween.esm.js";
import TimeLine from "./TimeLine.js";
import Arrange from "./Arrange.js";
import Segment from "./Segment.js";

TimeLine.update = function () {
    TWEEN.update();
};
TimeLine.Easing = TWEEN.Easing;

TimeLine.Arrange = Arrange;
TimeLine.Segment = Segment;

export default TimeLine;