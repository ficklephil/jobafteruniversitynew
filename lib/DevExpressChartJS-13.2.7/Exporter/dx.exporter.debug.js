/*! 
* DevExpress Exporter (part of ChartJS)
* Version: 13.2.7
* Build date: Feb 10, 2014
*
* Copyright (c) 2012 - 2014 Developer Express Inc. ALL RIGHTS RESERVED
* EULA: http://chartjs.devexpress.com/EULA
*/

"use strict";

if (!DevExpress.MOD_TMP_WIDGETS_FOR_EXPORTER) {
    /*! Module tmp-widgets-for-exporter, file ui.menu.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            utils = DX.utils,
            events = ui.events,
            DIV = '<div />',
            UL = '<ul />',
            BOTTOM = 'bottom',
            DXMENU = 'dxMenu',
            DXMENUITEM = 'dxMenuItem',
            DURATION = 50,
            CLICK = events.addNamespace('dxclick', DXMENU),
            MOUSEENTER = events.addNamespace('mouseenter', DXMENU),
            MOUSELEAVE = events.addNamespace('mouseleave', DXMENU),
            DXPOINTERDOWN = events.addNamespace('dxpointerdown', DXMENU),
            MOUSEMOVE = events.addNamespace('mousemove', DXMENU),
            DX_MENU_ITEM_ITEMS_OVER = 'dx-menu-item-items-over',
            DX_MENU_ITEM_HOVERED = 'dx-menu-item-hovered',
            DX_MENU_ITEM_HIGHLIGHT = 'dx-menu-item-highlight',
            DX_MENU_ITEM_DISABLED = 'dx-menu-item-disabled';
        var menuItem = DX.Class.inherit({
                _addItems: function(options) {
                    var _this = this;
                    $.each(options.items, function(_, itemOptions) {
                        var child = new menuItem(itemOptions, _this);
                        _this._items.push(child)
                    })
                },
                _createOverlay: function($element, $container, isHorizontalMenu) {
                    var _this = this;
                    return $element.dxOverlay({
                            targetContainer: $container,
                            closeOnOutsideClick: true,
                            closeOnTargetScroll: true,
                            position: {
                                offset: _this._calculateOffset(isHorizontalMenu),
                                my: DX.inverseAlign(_this._horizontalExpandDirection) + ' ' + DX.inverseAlign(_this._verticalExpandDirection),
                                at: isHorizontalMenu ? DX.inverseAlign(_this._horizontalExpandDirection) + ' ' + _this._verticalExpandDirection : _this._horizontalExpandDirection + ' ' + DX.inverseAlign(_this._verticalExpandDirection),
                                of: _this._$item,
                                collision: 'flip'
                            },
                            showTitle: false,
                            width: 'auto',
                            height: 'auto',
                            shading: false,
                            deferRendering: false,
                            animation: {
                                show: {
                                    type: 'fade',
                                    from: 0,
                                    to: 1,
                                    duration: DURATION
                                },
                                hide: {
                                    type: 'fade',
                                    from: 1,
                                    to: 0,
                                    delay: 0,
                                    duration: 0
                                }
                            },
                            positionedAction: function(options) {
                                var commonDirectionOpeningSubMenu = _this._parent._horizontalExpandDirection || _this._horizontalExpandDirection,
                                    children = options.component.content().children();
                                _this._horizontalExpandDirection = options.position.h.flip ? DX.inverseAlign(commonDirectionOpeningSubMenu) : commonDirectionOpeningSubMenu;
                                if (_this._$item.offset().top > _this._overlay.content().offset().top)
                                    _this._$item.addClass(DX_MENU_ITEM_ITEMS_OVER);
                                _this._$item.data('__flipped', _this)
                            },
                            showingAction: function(object) {
                                isHorizontalMenu && _this._overlay.content().css('min-width', _this._$item.outerWidth());
                                _this._$item.addClass(DX_MENU_ITEM_HOVERED)
                            },
                            hiddenAction: function() {
                                _this._$item.removeClass(DX_MENU_ITEM_HOVERED).removeClass(DX_MENU_ITEM_ITEMS_OVER)
                            }
                        }).dxOverlay('instance')
                },
                _drawItem: function() {
                    var _this = this,
                        SPAN = '<span />',
                        $item = $(DIV).addClass('dx-menu-item'),
                        $image,
                        $caption,
                        $choserDown;
                    if (_this.options.imageUrl || _this.options.imageCSS) {
                        $image = $(SPAN).addClass('dx-menu-image');
                        _this.options.imageUrl && $image.append('<img src="' + _this.options.imageUrl + '" />');
                        _this.options.imageCSS && $image.addClass(_this.options.imageCSS);
                        $item.append($image)
                    }
                    if (_this.options.caption) {
                        $caption = $(SPAN).addClass('dx-menu-caption').text(_this.options.caption);
                        $item.append($caption)
                    }
                    if (_this._items.length) {
                        $choserDown = $(SPAN).addClass('dx-menu-chouser-down');
                        $item.append($choserDown)
                    }
                    _this.options.disabled && $item.addClass(DX_MENU_ITEM_DISABLED);
                    return $item
                },
                _draw: function($element, isHorizontalMenu) {
                    var _this = this,
                        $item,
                        $overlay = $(DIV),
                        $childItems = $(UL),
                        $rootItem = $('<li />');
                    $overlay.append($childItems);
                    $item = _this._drawItem();
                    _this._$item = $item;
                    _this._$rootItem = $rootItem;
                    $rootItem.append($item);
                    $rootItem.data(DXMENUITEM, _this);
                    $element.append($rootItem);
                    if (_this._items.length) {
                        $rootItem.append($overlay);
                        _this._overlay = _this._createOverlay($overlay, $rootItem, isHorizontalMenu)
                    }
                    $.each(_this._items, function(_, item) {
                        item._draw(_this._overlay.content().children(), false)
                    })
                },
                _hideAllChildren: function() {
                    $.each(this._items, function() {
                        this._togglePopup(false);
                        this._hideAllChildren()
                    })
                },
                _togglePopup: function(showing) {
                    var _this = this;
                    if (_this.options.disabled || !_this._overlay)
                        return;
                    if (!_this._visible) {
                        _this._hideAllChildren();
                        if (_this._parent._visible)
                            _this._overlay.option('position', {
                                offset: _this._calculateOffset(false),
                                my: DX.inverseAlign(_this._parent._horizontalExpandDirection) + ' ' + DX.inverseAlign(_this._verticalExpandDirection),
                                at: _this._parent._horizontalExpandDirection + ' ' + DX.inverseAlign(_this._verticalExpandDirection)
                            })
                    }
                    _this._overlay.toggle(showing);
                    _this._visible = _this._$item.hasClass(DX_MENU_ITEM_HOVERED)
                },
                _showPopupOnHoverStay: function() {
                    var _this = this;
                    _this._$rootItem.on(MOUSEMOVE, function(event) {
                        _this._X = event.pageX;
                        _this._Y = event.pageY
                    });
                    _this.compareTimer = setTimeout(function() {
                        compareCoords()
                    });
                    function compareCoords() {
                        if (Math.abs(_this._pX - _this._X) + Math.abs(_this._pY - _this._Y) < 3) {
                            _this._togglePopup(true);
                            _this._$rootItem.off(MOUSEMOVE)
                        }
                        else
                            _this.compareTimer = setTimeout(function() {
                                compareCoords()
                            }, DURATION);
                        _this._pX = _this._X;
                        _this._pY = _this._Y
                    }
                },
                _calculateOffset: function(toVerticalExpandDirection) {
                    var _this = this,
                        horizontOffset,
                        verticalOffset,
                        padding = (_this._$rootItem.innerWidth() - _this._$rootItem.width()) / 2,
                        border = (_this._$rootItem.parent().outerWidth() - _this._$rootItem.parent().innerWidth()) / 2;
                    if (toVerticalExpandDirection) {
                        horizontOffset = 0;
                        verticalOffset = _this._parent._verticalExpandDirection === BOTTOM ? -1 : 1
                    }
                    else {
                        horizontOffset = _this._parent._horizontalExpandDirection === 'right' ? padding : -padding;
                        verticalOffset = _this._parent._verticalExpandDirection === BOTTOM ? -(border + padding) : border + padding
                    }
                    return horizontOffset + ' ' + verticalOffset
                },
                toggleItemEnabledState: function(enabled) {
                    this.options.disabled = utils.isDefined(enabled) ? enabled : !this.options.disabled;
                    this._$item.toggleClass(DX_MENU_ITEM_DISABLED, enabled)
                },
                ctor: function(options, parent) {
                    var _this = this;
                    _this.options = options || {};
                    _this.options.disabled = options.disabled || false;
                    _this._items = [];
                    _this._parent = parent;
                    _this._horizontalExpandDirection = options.horizontalExpandDirection || parent._horizontalExpandDirection;
                    _this._verticalExpandDirection = options.verticalExpandDirection || parent._verticalExpandDirection;
                    if (options.items && options.items.length)
                        _this._addItems(options)
                }
            });
        ui.registerComponent('dxMenu', ui.Widget.inherit({
            _init: function() {
                var options = this.option(['items', 'name', 'verticalExpandDirection', 'horizontalExpandDirection']);
                this._mainMenuItem = new menuItem(options)
            },
            _defaultOptions: function() {
                return {
                        verticalExpandDirection: BOTTOM,
                        horizontalExpandDirection: 'right',
                        highlightActiveItem: false,
                        showPopupMode: 'onhover',
                        orientation: 'horizontal'
                    }
            },
            addItems: function(options) {
                this._mainMenuItem._addItems(options);
                this._render()
            },
            _render: function() {
                var _this = this,
                    isHorizontalMenu = _this.option('orientation') !== 'vertical',
                    $element = _this._element(),
                    $menu = $(UL),
                    $container = $(DIV).append($menu);
                isHorizontalMenu ? $menu.addClass('dx-menu-horizontal') : $menu.addClass('dx-menu-vertical');
                $element.addClass('dx-menu');
                _this._highlightActiveItem = _this.option('highlightActiveItem');
                _this._clickAction = _this._createActionByOption('itemClickAction');
                $element.append($container);
                _this._resubscribeEventHandlers($element, 'li');
                $.each(_this._mainMenuItem._items, function(_, item) {
                    item._draw($menu, isHorizontalMenu)
                });
                if (_this._highlightActiveItem) {
                    _this._$highlightedElement = _this._mainMenuItem._items[0]._items[0]._$item;
                    _this._$highlightedElement.addClass(DX_MENU_ITEM_HIGHLIGHT)
                }
            },
            _resubscribeEventHandlers: function($element, selector) {
                var _this = this,
                    hoverMode = _this.option('showPopupMode') || '',
                    events = {};
                switch (hoverMode.toLowerCase()) {
                    case'onclick':
                        break;
                    case'onhoverstay':
                        events[MOUSEENTER] = _this._itemOnHoverStayHandler(true);
                        events[MOUSELEAVE] = _this._itemOnHoverStayHandler(false);
                        break;
                    default:
                        events[MOUSEENTER] = _this._itemOnHoverHandler(true);
                        events[MOUSELEAVE] = _this._itemOnHoverHandler(false)
                }
                events[DXPOINTERDOWN] = function(event) {
                    event.stopPropagation()
                };
                events[CLICK] = _this._itemOnClickHandler();
                $element.off('.dxMenu').on(events, selector)
            },
            _itemOnHoverHandler: function(showing) {
                return function() {
                        var item = $(this).data(DXMENUITEM);
                        item._togglePopup(showing)
                    }
            },
            _itemOnHoverStayHandler: function(showing) {
                return function() {
                        var item = $(this).data(DXMENUITEM);
                        if (showing)
                            item._showPopupOnHoverStay();
                        else {
                            clearTimeout(item.compareTimer);
                            item._$rootItem.off(MOUSEMOVE);
                            item._togglePopup(false)
                        }
                    }
            },
            _itemOnClickHandler: function() {
                var _this = this;
                return function(event) {
                        var item = $(this).data(DXMENUITEM);
                        if (item._$item[0].contains(event.target)) {
                            if (item._overlay && !item._overlay.option('visible'))
                                item._parent._hideAllChildren();
                            item._togglePopup()
                        }
                        if (!item.options.disabled && !item._items.length) {
                            if (_this._highlightActiveItem) {
                                _this._$highlightedElement.removeClass(DX_MENU_ITEM_HIGHLIGHT);
                                _this._$highlightedElement = item._$item;
                                _this._$highlightedElement.addClass(DX_MENU_ITEM_HIGHLIGHT)
                            }
                            _this._clickAction({
                                item: item,
                                itemElement: item._$item
                            });
                            _this._mainMenuItem._hideAllChildren()
                        }
                    }
            }
        }));
        ui.dxMenu.__internals = {MENU_AMIMATION_DURATION: DURATION}
    })(jQuery, DevExpress);
    /*! Module tmp-widgets-for-exporter, file ui.overlay.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            utils = DX.utils,
            events = ui.events;
        var OVERLAY_CLASS = "dx-overlay",
            OVERLAY_WRAPPER_CLASS = OVERLAY_CLASS + "-wrapper",
            OVERLAY_CONTENT_CLASS = OVERLAY_CLASS + "-content",
            OVERLAY_SHADER_CLASS = OVERLAY_CLASS + "-shader",
            OVERLAY_MODAL_CLASS = OVERLAY_CLASS + "-modal",
            OVERLAY_SHOW_EVENT_TOLERANCE = 500,
            ACTIONS = ["showingAction", "shownAction", "hidingAction", "hiddenAction", "positioningAction", "positionedAction"],
            LAST_Z_INDEX = 1000,
            DISABLED_STATE_CLASS = "dx-state-disabled";
        ui.registerComponent("dxOverlay", ui.ContainerWidget.inherit({
            _defaultOptions: function() {
                return $.extend(this.callBase(), {
                        activeStateEnabled: false,
                        visible: false,
                        shading: true,
                        closeOnOutsideClick: false,
                        closeOnTargetScroll: false,
                        position: {
                            my: "center",
                            at: "center",
                            of: window
                        },
                        animation: {
                            show: {
                                type: "pop",
                                duration: 400
                            },
                            hide: {
                                type: "pop",
                                duration: 400,
                                to: {
                                    opacity: 0,
                                    scale: 0
                                },
                                from: {
                                    opacity: 1,
                                    scale: 1
                                }
                            }
                        },
                        showingAction: null,
                        shownAction: null,
                        hidingAction: null,
                        hiddenAction: null,
                        width: function() {
                            return $(window).width() * 0.8
                        },
                        height: function() {
                            return $(window).height() * 0.8
                        },
                        deferRendering: true,
                        disabled: false,
                        targetContainer: undefined,
                        positioningAction: null,
                        positionedAction: null
                    })
            },
            _optionsByReference: function() {
                return $.extend(this.callBase(), {animation: true})
            },
            _wrapper: function() {
                return this._$wrapper
            },
            _clickEventContainer: function() {
                return this._$container
            },
            _init: function() {
                this.callBase();
                this._actions = {};
                this._deferredAnimate = undefined;
                this._attachCloseOnOutsideClickHandler();
                this._windowResizeCallback = $.proxy(this._repaint, this);
                utils.windowResizeCallbacks.add(this._windowResizeCallback);
                this._$wrapper = $("<div>").addClass(OVERLAY_WRAPPER_CLASS)
            },
            _initOptions: function(options) {
                this._setTargetContainer(options.targetContainer);
                this._backButtonHandler = options.backButtonHandler !== undefined ? this.backButtonHandler : this._defaultBackButtonHandler;
                this.callBase(options)
            },
            _setTargetContainer: function(targetContainer) {
                targetContainer = targetContainer === undefined ? DX.overlayTargetContainer() : targetContainer;
                var $element = this._element(),
                    $targetContainer = $element.closest(targetContainer);
                if (!$targetContainer.length)
                    $targetContainer = $(targetContainer).first();
                this._$targetContainer = $targetContainer.length ? $targetContainer : $element.parent()
            },
            _closeOnOutsideClickHandler: function(e) {
                var closeOnOutsideClick = this.option("closeOnOutsideClick"),
                    visible = this.option("visible");
                if ($.isFunction(closeOnOutsideClick))
                    closeOnOutsideClick = closeOnOutsideClick(e);
                if (closeOnOutsideClick && visible) {
                    var $container = this._$container,
                        outsideClick = !$container.is(e.target) && !$.contains($container.get(0), e.target),
                        showingEvent = Math.abs(e.timeStamp - this._showTimestamp) < OVERLAY_SHOW_EVENT_TOLERANCE;
                    if (outsideClick && !showingEvent)
                        this.hide()
                }
            },
            _attachCloseOnOutsideClickHandler: function() {
                var self = this,
                    eventNames = events.addNamespace("dxpointerdown", self.NAME);
                this._myCloseOnOutsideClickHandler = function() {
                    return self._closeOnOutsideClickHandler.apply(self, arguments)
                };
                $(document).on(eventNames, this._myCloseOnOutsideClickHandler)
            },
            _detachCloseOnOutsideClickHandler: function() {
                var eventNames = events.addNamespace("dxpointerdown", this.NAME);
                $(document).off(eventNames, this._myCloseOnOutsideClickHandler)
            },
            _render: function() {
                var $element = this._element(),
                    deferRendering = this.option("deferRendering");
                this._$container = $("<div>").addClass(OVERLAY_CONTENT_CLASS);
                this._$wrapper.addClass($element.attr("class"));
                this._renderActions();
                this.callBase();
                this._renderStyles();
                $element.addClass(OVERLAY_CLASS)
            },
            _renderStyles: function() {
                this._renderShader();
                this._renderModalState();
                this._renderDimensions();
                this._renderVisibility()
            },
            _renderShader: function() {
                this._$wrapper.toggleClass(OVERLAY_SHADER_CLASS, this.option("shading"))
            },
            _renderModalState: function() {
                this._$wrapper.toggleClass(OVERLAY_MODAL_CLASS, this.option("shading") && !this.option("targetContainer"))
            },
            _renderDimensions: function() {
                this._$container.width(this.option("width")).height(this.option("height"))
            },
            _renderVisibility: function() {
                var visible = this.option("visible");
                DX.fx.stop(this._$container, true);
                if (visible) {
                    this._renderContent();
                    this._renderPosition()
                }
                this._toggleVisibility(visible)
            },
            _renderActions: function() {
                var self = this;
                $.each(ACTIONS, function(_, itemAction) {
                    self._actions[itemAction] = self._createActionByOption(itemAction)
                })
            },
            _renderContent: function() {
                if (this._contentAlreadyRendered || !this.option("visible") && this.option("deferRendering"))
                    return;
                this._contentAlreadyRendered = true;
                this._moveFromTargetContainer();
                this.callBase()
            },
            _moveFromTargetContainer: function() {
                this._$container.appendTo(this._element());
                this._detachWrapperToTargetContainer()
            },
            _detachWrapperToTargetContainer: function() {
                this._$wrapper.detach()
            },
            _renderContentImpl: function(template) {
                this._renderInnerContent(template);
                this._moveToTargetContainer()
            },
            _renderInnerContent: function(template) {
                var $element = this._element();
                this._$container.append($element.contents()).appendTo($element);
                (template || this._templates.template).render(this.content())
            },
            _moveToTargetContainer: function() {
                this._attachWrapperToTargetContainer();
                this._$container.appendTo(this._$wrapper)
            },
            _attachWrapperToTargetContainer: function() {
                var $element = this._element();
                if (this._$targetContainer && !(this._$targetContainer[0] === $element.parent()[0]))
                    this._$wrapper.appendTo(this._$targetContainer);
                else
                    this._$wrapper.appendTo($element)
            },
            _renderPosition: function() {
                var position = this.option("position");
                if (this.option("shading")) {
                    var $wrapper = this._$wrapper.show(),
                        $positionOf = $(position.of);
                    DX.position($wrapper, {
                        my: "top left",
                        at: "top left",
                        of: $positionOf
                    });
                    $wrapper.css({
                        width: $positionOf.outerWidth(),
                        height: $positionOf.outerHeight()
                    })
                }
                this._$container.css("transform", "none");
                var containerPosition = DX.calculatePosition(this._$container, position);
                this._actions.positioningAction({position: containerPosition});
                var resultPosition = DX.position(this._$container, containerPosition);
                this._actions.positionedAction({position: resultPosition})
            },
            _subscribeParentScroll: function() {
                var self = this,
                    closeOnScroll = this.option("closeOnTargetScroll"),
                    position = this.option("position");
                if (!closeOnScroll || !position || !position.of)
                    return;
                $(position.of).parents().on(events.addNamespace("scroll", self.NAME), function(e) {
                    if (e.overlayProcessed)
                        return;
                    e.overlayProcessed = true;
                    self.hide()
                })
            },
            _unsubscribeParentScroll: function() {
                var self = this,
                    closeOnScroll = this.option("closeOnTargetScroll"),
                    position = this.option("position");
                if (!closeOnScroll || !position || !position.of)
                    return;
                $(position.of).parents().off(events.addNamespace("scroll", self.NAME))
            },
            _clean: function() {
                delete this._contentAlreadyRendered
            },
            _refresh: function() {
                this._renderStyles()
            },
            _repaint: function() {
                if (!this.option("visible"))
                    return;
                this._renderDimensions();
                this._renderPosition()
            },
            _dispose: function() {
                DX.fx.stop(this._$container);
                utils.windowResizeCallbacks.remove(this._windowResizeCallback);
                if (this.closeCallback)
                    DX.backButtonCallback.remove(this.closeCallback);
                this._detachCloseOnOutsideClickHandler();
                this._actions = null;
                this.callBase();
                this._$wrapper.remove();
                this._$container.remove()
            },
            _renderVisibilityAnimate: function() {
                var visible = this.option("visible");
                if (visible)
                    this._showTimestamp = $.now();
                DX.fx.stop(this._$container, true);
                if (visible)
                    this._makeVisible();
                else
                    this._makeHidden()
            },
            _makeVisible: function() {
                var self = this,
                    animation = self.option("animation") || {};
                this._$wrapper.css("z-index", ++LAST_Z_INDEX);
                this._actions.showingAction();
                this._toggleVisibility(true);
                this._renderContent();
                this._renderPosition();
                if (animation.show) {
                    var animationComplete = animation.show.complete || $.noop;
                    self._animate($.extend({}, animation.show, {complete: function() {
                            animationComplete.apply(this, arguments);
                            self._notifyShowComplete()
                        }}))
                }
                else
                    self._notifyShowComplete()
            },
            _notifyShowComplete: function() {
                this._actions.shownAction();
                if (this._deferredAnimate)
                    this._deferredAnimate.resolveWith(this)
            },
            _makeHidden: function() {
                var self = this,
                    animation = this.option("animation") || {};
                this._actions.hidingAction();
                this._$wrapper.toggleClass(OVERLAY_SHADER_CLASS, false);
                if (animation.hide) {
                    var animationComplete = animation.hide.complete || $.noop;
                    self._animate($.extend({}, animation.hide, {complete: function() {
                            self._toggleVisibility(false);
                            animationComplete.apply(this, arguments);
                            self._notifyHideComplete()
                        }}))
                }
                else {
                    self._toggleVisibility(false);
                    self._notifyHideComplete()
                }
            },
            _notifyHideComplete: function() {
                this._actions.hiddenAction();
                if (this._deferredAnimate)
                    this._deferredAnimate.resolveWith(this)
            },
            _animate: function(animation) {
                if ($.isPlainObject(animation))
                    DX.fx.animate(this._$container, animation)
            },
            _toggleVisibility: function(visible) {
                if (visible) {
                    this._moveToTargetContainer();
                    this._subscribeParentScroll()
                }
                this._$container.toggle(visible);
                if (!visible) {
                    this._moveFromTargetContainer();
                    this._unsubscribeParentScroll()
                }
                this._$wrapper.toggleClass(OVERLAY_SHADER_CLASS, this.option("shading") && visible)
            },
            _defaultBackButtonHandler: function() {
                this.hide()
            },
            _toggleBackButtonCallback: function() {
                if (this._backButtonHandler)
                    if (this.option("visible")) {
                        this.closeCallback = $.proxy(this._backButtonHandler, this);
                        DX.backButtonCallback.add(this.closeCallback)
                    }
                    else if (this.closeCallback)
                        DX.backButtonCallback.remove(this.closeCallback)
            },
            _toggleDisabledState: function(value) {
                this.callBase.apply(this, arguments);
                this._$container.toggleClass(DISABLED_STATE_CLASS, value)
            },
            _optionChanged: function(name, value) {
                if ($.inArray(name, ACTIONS) > -1) {
                    this._renderActions();
                    return
                }
                switch (name) {
                    case"position":
                        if (this.option("visible"))
                            this._renderPosition();
                        break;
                    case"visible":
                        this._toggleBackButtonCallback();
                        this._renderVisibilityAnimate();
                        break;
                    case"targetContainer":
                        this._setTargetContainer(value);
                        this._moveToTargetContainer();
                        this._renderStyles();
                        break;
                    case"closeOnOutsideClick":
                        break;
                    default:
                        this.callBase.apply(this, arguments)
                }
            },
            toggle: function(showing) {
                showing = showing === undefined ? !this.option("visible") : showing;
                if (showing === this.option("visible"))
                    return $.Deferred().resolve().promise();
                this._deferredAnimate = $.Deferred();
                this.option("visible", showing);
                return this._deferredAnimate.promise()
            },
            show: function() {
                return this.toggle(true)
            },
            hide: function() {
                return this.toggle(false)
            },
            content: function() {
                return this._$container
            },
            repaint: function() {
                this._repaint()
            }
        }));
        ui.dxOverlay.__internals = {
            OVERLAY_SHOW_EVENT_TOLERANCE: OVERLAY_SHOW_EVENT_TOLERANCE,
            OVERLAY_CLASS: OVERLAY_CLASS,
            OVERLAY_WRAPPER_CLASS: OVERLAY_WRAPPER_CLASS,
            OVERLAY_CONTENT_CLASS: OVERLAY_CONTENT_CLASS,
            OVERLAY_SHADER_CLASS: OVERLAY_SHADER_CLASS,
            OVERLAY_MODAL_CLASS: OVERLAY_MODAL_CLASS
        }
    })(jQuery, DevExpress);
    DevExpress.MOD_TMP_WIDGETS_FOR_EXPORTER = true
}
if (!DevExpress.MOD_TMP_EXPORTER) {
    /*! Module tmp-exporter, file exporter.js */
    (function(DX, $) {
        var ui = DX.ui,
            utils = DX.utils,
            FILE = "file",
            BODY = "body",
            ICON_TO = 'dx-exporter-icon-to',
            ICON_PRINT = 'dx-exporter-icon-print',
            NO_PRINTABLE = 'dx-non-printable',
            PRINTABLE = 'dx-printable',
            FORMATS_EXPORT = ['PDF', 'PNG', 'SVG'],
            core = DX.viz.core;
        var Exporter = ui.Component.inherit({
                _normalizeHtml: function(html) {
                    return core.widgetMarkupMixin._normalizeHtml(html)
                },
                _getSvgElements: function() {
                    var _this = this,
                        svgArray = [];
                    $($(_this.option('sourceContainerId'))).find("svg").each(function(i) {
                        svgArray[i] = _this._normalizeHtml($(this).clone().wrap("<div></div>").parent().html())
                    });
                    return JSON.stringify(svgArray)
                },
                _appendTextArea: function(name, value, rootElement) {
                    $("<textarea/>", {
                        id: name,
                        name: name,
                        val: value
                    }).appendTo(rootElement)
                },
                _formSubmit: function(form) {
                    form.submit();
                    form.remove();
                    return form.submit()
                },
                _defaultOptions: function() {
                    return {
                            menuAlign: 'right',
                            exportFormat: FORMATS_EXPORT,
                            printingEnabled: true,
                            fileName: FILE
                        }
                },
                _createWindow: function() {
                    return window.open('', 'printDiv', '')
                },
                _createExportItems: function(exportFormat) {
                    var _this = this;
                    return $.map(exportFormat, function(value) {
                            value = value.toUpperCase();
                            if ($($(_this.option('sourceContainerId'))).find("svg").length > 1 && value === "SVG")
                                return null;
                            if ($.inArray(value.toUpperCase(), FORMATS_EXPORT) === -1)
                                return null;
                            return {
                                    name: value,
                                    caption: value + ' ' + FILE
                                }
                        })
                },
                _render: function() {
                    var _this = this,
                        fileName = _this.option('fileName'),
                        exportItems = _this._createExportItems(_this.option('exportFormat')),
                        container = $('<div />'),
                        rootItems = [{
                                name: 'export',
                                imageCSS: ICON_TO,
                                items: exportItems
                            }],
                        options = {
                            align: _this.option('menuAlign'),
                            items: rootItems,
                            itemClickAction: function(properties) {
                                switch (properties.item.options.name) {
                                    case'print':
                                        _this.print();
                                        break;
                                    default:
                                        _this.exportTo(fileName, properties.item.options.name)
                                }
                            }
                        };
                    _this.option('printingEnabled') && rootItems.push({
                        imageCSS: ICON_PRINT,
                        name: 'print',
                        click: function() {
                            _this.print()
                        }
                    });
                    container.dxMenu(options);
                    _this._$element.empty();
                    _this._$element.append(container);
                    return options
                },
                print: function() {
                    var $sourceContainer = $(this.option('sourceContainerId')).html(),
                        printWindow = this._createWindow();
                    $(printWindow.document.body).html($sourceContainer);
                    printWindow.document.close();
                    printWindow.focus();
                    printWindow.print();
                    printWindow.close()
                },
                exportTo: function(fileName, format) {
                    var _this = this,
                        $sourceContainer = $(_this.option('sourceContainerId')),
                        form = $("<form/>", {
                            method: "POST",
                            action: _this.option('serverUrl'),
                            enctype: "application/x-www-form-urlencoded",
                            target: "_self",
                            css: {
                                display: "none",
                                visibility: "hidden"
                            }
                        });
                    _this._appendTextArea("exportContent", $sourceContainer.clone().wrap("<div></div>").parent().html(), form);
                    _this._appendTextArea("svgElements", _this._getSvgElements(), form);
                    _this._appendTextArea("fileName", fileName, form);
                    _this._appendTextArea("format", format.toLowerCase(), form);
                    _this._appendTextArea("width", $sourceContainer.width(), form);
                    _this._appendTextArea("height", $sourceContainer.height(), form);
                    _this._appendTextArea("url", window.location.host, form);
                    $(document.body).append(form);
                    _this._testForm = form;
                    _this._formSubmit(form)
                }
            });
        $.extend(true, DX, {exporter: {Exporter: Exporter}});
        ui.registerComponent("dxExporter", Exporter)
    })(DevExpress, jQuery);
    DevExpress.MOD_TMP_EXPORTER = true
}
