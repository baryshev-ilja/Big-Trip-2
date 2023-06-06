import {render, RenderPosition, replace} from '../framework/render.js';
import EditFormView from '../view/edit-form-view.js';
import FiltersView from '../view/filters-view.js';
import MenuNavView from '../view/menu-nav-view.js';
import RouteWrapperView from '../view/route-wrapper-view.js';
import RouteInfoView from '../view/route-info-view.js';
import RouteCostView from '../view/route-cost-view.js';
import SortingView from '../view/sorting-view.js';
import TripEventsListView from '../view/trip-events-list-view.js';
import WaypointView from '../view/waypoint-view.js';
import NoPointsView from '../view/no-points-view.js';
import {getIsEscape} from '../utils/common.js';

const INITIAL_COUNT_OF_POINTS = 6;
const POINT_COUNT_PER_STEP = 1;

export default class ContentPresenter {
  #routeWrapperComponent = new RouteWrapperView();
  #tripEventsListComponent = new TripEventsListView();
  #newEventButtonComponent = null;
  #tripEventsContainer = null;
  #routeContainer = null;
  #menuContainer = null;
  #filtersContainer = null;
  #pointsModel = null;
  #filters = null;

  #points = [];
  #renderedPointsCount = INITIAL_COUNT_OF_POINTS;

  constructor({tripEventsContainer, routeContainer, menuContainer, filtersContainer, pointsModel, newEventButton, filters}) {
    this.#tripEventsContainer = tripEventsContainer;
    this.#routeContainer = routeContainer;
    this.#menuContainer = menuContainer;
    this.#filtersContainer = filtersContainer;
    this.#pointsModel = pointsModel;
    this.#newEventButtonComponent = newEventButton;
    this.#filters = filters;
  }

  init() {
    this.#points = [...this.#pointsModel.points];
    this.#renderBoard();
  }

  #renderPoint(point) {
    // Функция-обработчик нажатия клавиши Escape
    const escKeyDownHandler = (evt) => {
      if (getIsEscape(evt)) {
        evt.preventDefault();
        replaceFormToWaypoint.call(this);
        document.removeEventListener('keydown', escKeyDownHandler);
      }
    };

    const pointComponent = new WaypointView({
      point,
      onEditClick: () => {
        replaceWaypointToForm.call(this);
        document.addEventListener('keydown', escKeyDownHandler);
      }
    });

    const pointEditComponent = new EditFormView({
      point,
      onFormSubmit: () => {
        replaceFormToWaypoint.call(this);
        document.removeEventListener('keydown', escKeyDownHandler);
      }
    });

    // Функция, которая переводит точку маршрута в режим редактирования (открывается форма редактирования)
    function replaceWaypointToForm() {
      replace(pointEditComponent, pointComponent);
    }


    // Функция, которая переводит точку маршрута в режим редактирования (открывается форма редактирования)
    function replaceFormToWaypoint() {
      replace(pointComponent, pointEditComponent);
    }


    render(pointComponent, this.#tripEventsListComponent.element);
  }

  // Функция-обработчик нажатия на кнопку New event. Добавляет новую точку маршрута из массива с данными
  #newEventButtonHandler = (evt) => {
    evt.preventDefault();
    this.#points
      .slice(this.#renderedPointsCount, this.#renderedPointsCount + POINT_COUNT_PER_STEP)
      .forEach((point) => this.#renderPoint(point));

    this.#renderedPointsCount += POINT_COUNT_PER_STEP;
  };

  #renderBoard() {
    render(this.#routeWrapperComponent, this.#routeContainer, RenderPosition.AFTERBEGIN);
    render(new RouteInfoView(), this.#routeWrapperComponent.element);
    render(new RouteCostView(), this.#routeWrapperComponent.element);
    render(new MenuNavView(), this.#menuContainer);
    render(new FiltersView({this.#filters}), this.#filtersContainer);

    if (this.#points.length === 0) {
      render(new NoPointsView(), this.#tripEventsContainer);
    } else {
      render(new SortingView(), this.#tripEventsContainer);
      render(this.#tripEventsListComponent, this.#tripEventsContainer);
      for (let i = 0; i < Math.min(this.#points.length, INITIAL_COUNT_OF_POINTS); i++) {
        this.#renderPoint(this.#points[i]);
      }
    }

    this.#newEventButtonComponent.addEventListener('click', this.#newEventButtonHandler);
  }
}
