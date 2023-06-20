import {createRandomWaypoint} from '../mock/waypoint-mock.js';

const POINT_COUNT = 2;

export default class PointsModel {
  #points = Array.from({length: POINT_COUNT}, createRandomWaypoint);

  get points() {
    return this.#points;
  }
}
