var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Project;
(function (Project) {
    var Application = (function (_super) {
        __extends(Application, _super);
        function Application() {
            var _this = _super.call(this, {
                type: Phaser.AUTO,
                scale: {
                    parent: 'game-container',
                    mode: Phaser.Scale.FIT,
                    autoCenter: Phaser.Scale.CENTER_BOTH,
                    width: 800,
                    height: 600
                },
                backgroundColor: '#efefef',
                scene: [Project.Preloader, Project.TitleScene, Project.ShopActivityScene, Project.PairsActivityScene, Project.CardCollectionScene]
            }) || this;
            _this.scene.start('Preloader');
            return _this;
        }
        return Application;
    }(Phaser.Game));
    Project.Application = Application;
})(Project || (Project = {}));
var Project;
(function (Project) {
    var CardCollection = (function (_super) {
        __extends(CardCollection, _super);
        function CardCollection(scene) {
            var _this = _super.call(this, scene, 0, 0) || this;
            _this.stacksByType = {};
            _this.nStacks = 0;
            _this.tempMatrix = new Phaser.GameObjects.Components.TransformMatrix();
            _this.tempParentMatrix = new Phaser.GameObjects.Components.TransformMatrix();
            _this.delta = new Phaser.Geom.Point();
            _this.dragDropEnabled = false;
            return _this;
        }
        CardCollection.prototype.updateLayout = function () {
            var i = 0;
            var nWidth = 110;
            for (var key in this.stacksByType) {
                if (this.stacksByType.hasOwnProperty(key)) {
                    var stack = this.stacksByType[key];
                    stack.iterate(function (child) {
                        child.angle = Phaser.Math.Between(-5, 5);
                        child.updateAnchor();
                    });
                    stack.x = (+this.scene.game.config.width / 2) - (nWidth * 0.5 * (this.nStacks - 1)) + (nWidth * i);
                    stack.y = (+this.scene.game.config.height) + (this.dragDropEnabled ? -160 : -10);
                    i++;
                }
            }
        };
        CardCollection.prototype.collectCard = function (type) {
            var card = new Project.DragCard(this.scene, 0, 0, type);
            card.on(Project.FLIP_CARD_EVENTS.HOVER_OVER, this.onCardHoverOver, this);
            card.on(Project.FLIP_CARD_EVENTS.HOVER_OUT, this.onCardHoverOut, this);
            var stack = this.stacksByType[type];
            if (!stack) {
                this.stacksByType[type] = stack = new Phaser.GameObjects.Container(this.scene);
                this.add(stack);
                this.nStacks++;
            }
            stack.add(card);
            this.updateLayout();
        };
        CardCollection.prototype.removeCard = function (card) {
            card.destroy();
            for (var key in this.stacksByType) {
                if (this.stacksByType.hasOwnProperty(key)) {
                    var stack = this.stacksByType[key];
                    if (!stack || stack.list.length == 0) {
                        this.stacksByType[key].destroy();
                        delete this.stacksByType[key];
                        this.nStacks--;
                    }
                }
            }
            this.updateLayout();
        };
        CardCollection.prototype.disableDragDrop = function () {
            var _this = this;
            if (!this.dragDropEnabled)
                return;
            for (var key in this.stacksByType) {
                if (this.stacksByType.hasOwnProperty(key)) {
                    var stack = this.stacksByType[key];
                    if (!stack)
                        continue;
                    stack.iterate(function (dragCard) {
                        try {
                            if (!dragCard)
                                return;
                            dragCard.disable();
                            _this.scene.input.setDraggable(dragCard, false);
                        }
                        catch (e) {
                            console.log('Dodged an unresolved issue', e.message);
                        }
                    });
                }
            }
            this.scene.input.off('dragstart', this.onDragStart, this);
            this.scene.input.off('drag', this.onDrag, this);
            this.scene.input.off('dragend', this.onDragEnd, this);
            this.dragDropEnabled = false;
            this.updateLayout();
        };
        CardCollection.prototype.enableDragDrop = function () {
            if (this.dragDropEnabled)
                return;
            for (var key in this.stacksByType) {
                if (this.stacksByType.hasOwnProperty(key)) {
                    var stack = this.stacksByType[key];
                    if (stack.list.length == 0)
                        continue;
                    var topCard = stack.getAt(stack.list.length - 1);
                    topCard.enable();
                    this.scene.input.setDraggable(topCard, true);
                }
            }
            this.scene.input.on('dragstart', this.onDragStart, this);
            this.scene.input.on('drag', this.onDrag, this);
            this.scene.input.on('dragend', this.onDragEnd, this);
            this.dragDropEnabled = true;
            this.updateLayout();
        };
        CardCollection.prototype.checkDrop = function (card, wx, wy) {
            var shopScene = this.scene.scene.get('ShopActivityScene');
            var patronManager = shopScene.patronManager;
            for (var i = 0; i < patronManager.patrons.length; i++) {
                var patron = patronManager.patrons[i];
                patron.getWorldTransformMatrix(this.tempMatrix, this.tempParentMatrix);
                var d = this.tempMatrix.decomposeMatrix();
                this.delta.setTo(d.translateX - wx, d.translateY - wy);
                var len = Phaser.Geom.Point.GetMagnitude(this.delta);
                if (len <= Project.Patron.dropZoneRadius) {
                    console.log('---');
                    console.log('dropping card', card.type, 'patron needs card?', patron.needsCardOfType(card.type));
                    console.log('patronWorldPos', d.translateX, d.translateY);
                    console.log('cardWorldPos', wx, wy);
                    console.log('len', len);
                    if (patron.needsCardOfType(card.type)) {
                        patron.deliverCard(card.type);
                        this.removeCard(card);
                        return true;
                    }
                }
            }
            card.reset();
            return false;
        };
        CardCollection.prototype.onCardHoverOver = function (card) {
            this.bringToTop(card);
            card.raise();
        };
        CardCollection.prototype.onCardHoverOut = function (card) {
            card.lower();
        };
        CardCollection.prototype.onDragStart = function (pointer, card) {
            card.parentContainer.bringToTop(card);
        };
        CardCollection.prototype.onDrag = function (pointer, card, dragX, dragY) {
            card.x = dragX;
            card.y = dragY;
        };
        CardCollection.prototype.onDragEnd = function (pointer, card, dropped) {
            this.checkDrop(card, pointer.worldX, pointer.worldY);
        };
        return CardCollection;
    }(Phaser.GameObjects.Container));
    Project.CardCollection = CardCollection;
})(Project || (Project = {}));
var Project;
(function (Project) {
    var CARD_TYPES;
    (function (CARD_TYPES) {
        CARD_TYPES["TRIANGLE"] = "triangle";
        CARD_TYPES["CIRCLE"] = "circle";
        CARD_TYPES["COG"] = "cog";
        CARD_TYPES["DROP"] = "drop";
        CARD_TYPES["TRAPEZOID"] = "trapezoid";
        CARD_TYPES["SEGMENT"] = "segment";
        CARD_TYPES["SQSTAR"] = "sqstar";
        CARD_TYPES["SQUARE"] = "square";
    })(CARD_TYPES = Project.CARD_TYPES || (Project.CARD_TYPES = {}));
})(Project || (Project = {}));
var Project;
(function (Project) {
    var DRAG_CARD_EVENTS;
    (function (DRAG_CARD_EVENTS) {
        DRAG_CARD_EVENTS["DESTROYED"] = "DESTROYED";
        DRAG_CARD_EVENTS["HOVER_OVER"] = "HOVER_OVER";
        DRAG_CARD_EVENTS["HOVER_OUT"] = "HOVER_OUT";
    })(DRAG_CARD_EVENTS = Project.DRAG_CARD_EVENTS || (Project.DRAG_CARD_EVENTS = {}));
    var DragCard = (function (_super) {
        __extends(DragCard, _super);
        function DragCard(scene, x, y, type) {
            var _this = _super.call(this, scene, x, y, Project.FlipCard.atlasName, type) || this;
            _this.anchorX = 0;
            _this.anchorY = 0;
            _this.anchorScale = 1;
            _this.anchorRotation = 0;
            _this.type = type;
            _this.setOrigin(0.5);
            _this.on('pointerover', function (pointer) {
                _this.emit(DRAG_CARD_EVENTS.HOVER_OVER, _this);
            }, _this);
            _this.on('pointerout', function (pointer) {
                _this.emit(DRAG_CARD_EVENTS.HOVER_OUT, _this);
            }, _this);
            return _this;
        }
        DragCard.prototype.destroy = function (fromScene) {
            this.emit(DRAG_CARD_EVENTS.DESTROYED, this);
            _super.prototype.destroy.call(this, fromScene);
        };
        DragCard.prototype.raise = function () {
            this.rotation = this.anchorRotation + ((2 * Math.PI) / 360) * Phaser.Math.Between(-10, 10);
            this.setScale(this.anchorScale + 0.1);
        };
        DragCard.prototype.lower = function () {
            this.reset();
        };
        DragCard.prototype.reset = function () {
            this.x = this.anchorX;
            this.y = this.anchorY;
            this.rotation = this.anchorRotation;
            this.setScale(this.anchorScale);
        };
        DragCard.prototype.enable = function () {
            this.setInteractive();
        };
        DragCard.prototype.disable = function () {
            this.disableInteractive();
        };
        DragCard.prototype.updateAnchor = function () {
            this.anchorX = this.x;
            this.anchorY = this.y;
            this.anchorScale = this.scale;
            this.anchorRotation = this.rotation;
            this.reset();
        };
        DragCard.atlasName = 'cards';
        return DragCard;
    }(Phaser.GameObjects.Sprite));
    Project.DragCard = DragCard;
})(Project || (Project = {}));
var Project;
(function (Project) {
    var CardFace;
    (function (CardFace) {
        CardFace["FRONT"] = "front";
        CardFace["BACK"] = "back";
    })(CardFace = Project.CardFace || (Project.CardFace = {}));
    var FLIP_CARD_EVENTS;
    (function (FLIP_CARD_EVENTS) {
        FLIP_CARD_EVENTS["DESTROYED"] = "DESTROYED";
        FLIP_CARD_EVENTS["DID_PRESS_FRONT"] = "DID_PRESS_FRONT";
        FLIP_CARD_EVENTS["DID_PRESS_BACK"] = "DID_PRESS_BACK";
        FLIP_CARD_EVENTS["WILL_SHOW_FRONT"] = "WILL_SHOW_FRONT";
        FLIP_CARD_EVENTS["WILL_SHOW_BACK"] = "WILL_SHOW_BACK";
        FLIP_CARD_EVENTS["HOVER_OVER"] = "HOVER_OVER";
        FLIP_CARD_EVENTS["HOVER_OUT"] = "HOVER_OUT";
    })(FLIP_CARD_EVENTS = Project.FLIP_CARD_EVENTS || (Project.FLIP_CARD_EVENTS = {}));
    var FlipCard = (function (_super) {
        __extends(FlipCard, _super);
        function FlipCard(scene, x, y, type) {
            var _this = _super.call(this, scene, x, y, FlipCard.atlasName, type) || this;
            _this.anchorX = 0;
            _this.anchorY = 0;
            _this.anchorScale = 1;
            _this.anchorRotation = 0;
            _this.type = type;
            _this.backFrame = FlipCard.backFrame;
            _this.setOrigin(0.5);
            _this.on('pointerup', function (pointer) {
                switch (_this.frame.name) {
                    case _this.backFrame:
                        _this.emit(FLIP_CARD_EVENTS.DID_PRESS_BACK, _this);
                        break;
                }
            }, _this);
            _this.on('pointerover', function (pointer) {
                switch (_this.frame.name) {
                    case _this.backFrame:
                        _this.emit(FLIP_CARD_EVENTS.HOVER_OVER, _this);
                        break;
                }
            }, _this);
            _this.on('pointerout', function (pointer) {
                switch (_this.frame.name) {
                    case _this.backFrame:
                        _this.emit(FLIP_CARD_EVENTS.HOVER_OUT, _this);
                        break;
                }
            }, _this);
            return _this;
        }
        FlipCard.prototype.destroy = function (fromScene) {
            this.emit(FLIP_CARD_EVENTS.DESTROYED, this);
            _super.prototype.destroy.call(this, fromScene);
        };
        FlipCard.prototype.enable = function () {
            this.setInteractive();
        };
        FlipCard.prototype.disable = function () {
            this.disableInteractive();
        };
        FlipCard.prototype.flip = function (animated) {
            if (animated === void 0) { animated = true; }
            if (this.frame.name == this.type)
                this.showFace(CardFace.BACK);
            else if (this.frame.name == this.backFrame)
                this.showFace(CardFace.FRONT);
        };
        FlipCard.prototype.showFace = function (face, animated) {
            if (animated === void 0) { animated = true; }
            switch (face) {
                case CardFace.FRONT:
                    this.emit(FLIP_CARD_EVENTS.WILL_SHOW_FRONT, this);
                    this.setFrame(this.type);
                    break;
                case CardFace.BACK:
                    this.emit(FLIP_CARD_EVENTS.WILL_SHOW_BACK, this);
                    this.setFrame(this.backFrame);
                    break;
            }
        };
        FlipCard.prototype.setFaceUp = function () {
            this.showFace(CardFace.FRONT);
        };
        FlipCard.prototype.setFaceDown = function () {
            this.showFace(CardFace.BACK);
        };
        FlipCard.prototype.raise = function () {
            this.rotation = this.anchorRotation + ((2 * Math.PI) / 360) * Phaser.Math.Between(-10, 10);
            this.setScale(this.anchorScale + 0.1);
        };
        FlipCard.prototype.lower = function () {
            this.reset();
        };
        FlipCard.prototype.reset = function () {
            this.setFaceDown();
            this.rotation = this.anchorRotation;
            this.setScale(this.anchorScale);
        };
        FlipCard.prototype.updateAnchor = function () {
            this.anchorX = this.x;
            this.anchorY = this.y;
            this.anchorScale = this.scale;
            this.anchorRotation = this.rotation;
            this.reset();
        };
        FlipCard.atlasName = 'cards';
        FlipCard.backFrame = 'back';
        return FlipCard;
    }(Phaser.GameObjects.Sprite));
    Project.FlipCard = FlipCard;
})(Project || (Project = {}));
var Project;
(function (Project) {
    var PATRON_EVENTS;
    (function (PATRON_EVENTS) {
        PATRON_EVENTS["COUNTDOWN_EXPIRED"] = "COUNTDOWN_EXPIRED";
        PATRON_EVENTS["SATISFIED"] = "SATISFIED";
    })(PATRON_EVENTS = Project.PATRON_EVENTS || (Project.PATRON_EVENTS = {}));
    var Patron = (function (_super) {
        __extends(Patron, _super);
        function Patron(scene, x, y) {
            var _this = _super.call(this, scene, x, y) || this;
            _this.request = [];
            _this.requestIcons = [];
            _this.endTime = 0;
            _this.portrait = new Phaser.GameObjects.Sprite(scene, 0, 0, 'portraits', 0);
            _this.portrait.setOrigin(0.5);
            _this.portrait.setScale(1.5);
            _this.add(_this.portrait);
            _this.requestIconContainer = new Phaser.GameObjects.Container(scene, 0, 0);
            _this.add(_this.requestIconContainer);
            _this.timeBar = new Phaser.GameObjects.Graphics(scene);
            _this.add(_this.timeBar);
            _this.updateTimeBar(1);
            _this.pickRandomFrame();
            _this.generateRequest();
            _this.bg = new Phaser.GameObjects.Graphics(_this.scene);
            var lw = 7;
            var pw = (_this.portrait.width * _this.portrait.scale) + lw * 2;
            var ph = 300;
            _this.bg.fillStyle(0xffffff, 1);
            _this.bg.lineStyle(lw, 0x000000, 1);
            _this.bg.fillRoundedRect(-pw * 0.5, (-ph * 0.5) + 30, pw, ph, 10);
            _this.bg.stroke();
            _this.addAt(_this.bg, 0);
            _this.dropZone = new Phaser.GameObjects.Zone(_this.scene, 0, 0).setRectangleDropZone(_this.portrait.width, _this.portrait.height);
            return _this;
        }
        Patron.prototype.pickRandomFrame = function () {
            this.portrait.setFrame(Phaser.Math.Between(0, Patron.nFrames));
            this.updateLayout();
        };
        Patron.prototype.updateLayout = function () {
            this.requestIconContainer.x = this.portrait.x - ((Patron.iconCellWidth * (this.requestIcons.length - 1)) / 2);
            this.requestIconContainer.y = this.portrait.y + this.portrait.height;
            this.timeBar.x = this.portrait.x - ((this.portrait.width * this.portrait.scale) / 2);
            this.timeBar.y = this.portrait.y + ((this.portrait.height * this.portrait.scale) / 2);
        };
        Patron.prototype.updateRequestView = function () {
            while (this.requestIcons.length)
                this.requestIcons.pop().destroy();
            for (var i = 0; i < this.request.length; i++) {
                var rCode = this.request[i];
                var rIcon = new Phaser.GameObjects.Sprite(this.scene, 0, 0, 'ui', rCode);
                this.requestIcons.push(rIcon);
                this.requestIconContainer.add(rIcon);
            }
            Phaser.Actions.GridAlign(this.requestIcons, {
                width: this.requestIcons.length,
                height: 1,
                cellWidth: Patron.iconCellWidth,
                cellHeight: 0
            });
            this.updateLayout();
        };
        Patron.prototype.updateTimeBar = function (progress) {
            this.timeBar.clear();
            var col = Patron.GREEN;
            if (progress < 0.5)
                col = Patron.YELLOW;
            if (progress < 0.25)
                col = Patron.RED;
            this.timeBar.fillStyle(col, 1);
            this.timeBar.fillRect(0, 0, this.portrait.width * this.portrait.scale * progress, 10);
        };
        Patron.prototype.generateRequest = function () {
            this.expired = false;
            this.request = [];
            var resourceTypes = [
                Project.CARD_TYPES.CIRCLE,
                Project.CARD_TYPES.COG,
                Project.CARD_TYPES.DROP,
                Project.CARD_TYPES.SEGMENT,
                Project.CARD_TYPES.SQSTAR,
                Project.CARD_TYPES.SQUARE,
                Project.CARD_TYPES.TRAPEZOID,
                Project.CARD_TYPES.TRIANGLE
            ];
            var escape = false;
            while (!escape) {
                var idx = Math.floor(resourceTypes.length * Math.random());
                this.request.push(resourceTypes[idx]);
                if (Math.random() > 0.8 || (this.request.length >= 3))
                    escape = true;
            }
            this.updateRequestView();
            this.startCountDown();
        };
        Patron.prototype.getDropZone = function () {
            return this.dropZone.getBounds();
        };
        Patron.prototype.update = function (timestamp, elapsed) {
            if (this.expired)
                this.countdownExpired();
            var clockTime = new Date().getTime();
            var deltaTime = this.endTime - clockTime;
            var p = deltaTime / Patron.countdownTime;
            this.updateTimeBar(p);
            if (p <= 0) {
                this.expired = true;
                this.countdownExpired();
            }
        };
        Patron.prototype.startCountDown = function () {
            this.endTime = new Date().getTime() + Patron.countdownTime;
        };
        Patron.prototype.countdownExpired = function () {
            this.emit(PATRON_EVENTS.COUNTDOWN_EXPIRED, this, [this]);
        };
        Patron.prototype.needsCardOfType = function (type) {
            return (this.request.indexOf(type) > -1);
        };
        Patron.prototype.deliverCard = function (type) {
            var idx = this.request.indexOf(type);
            if (idx > -1) {
                this.request.splice(idx, 1);
                this.updateRequestView();
            }
            var clockTime = new Date().getTime();
            var deltaTime = this.endTime - clockTime;
            var p = deltaTime / Patron.countdownTime;
            p = p + Patron.rewardProgress;
            p = Math.min(1, p);
            this.endTime = clockTime + Patron.countdownTime * p;
            this.scene.game.sound.play('yeah');
            if (this.request.length == 0)
                this.patronSatisfied();
        };
        Patron.prototype.patronSatisfied = function () {
            this.emit(PATRON_EVENTS.SATISFIED, this, [this]);
        };
        Patron.nFrames = 107;
        Patron.iconCellWidth = 74;
        Patron.dropZoneRadius = 200;
        Patron.countdownTime = 90000;
        Patron.rewardProgress = 0.25;
        Patron.GREEN = 0x966FE6;
        Patron.RED = 0xE66F6F;
        Patron.YELLOW = 0xE6976F;
        return Patron;
    }(Phaser.GameObjects.Container));
    Project.Patron = Patron;
})(Project || (Project = {}));
var Project;
(function (Project) {
    var PATRON_MANAGER_EVENTS;
    (function (PATRON_MANAGER_EVENTS) {
        PATRON_MANAGER_EVENTS["PATRON_EXPIRED"] = "PATRON_EXPIRED";
        PATRON_MANAGER_EVENTS["PATRON_SATISFIED"] = "PATRON_SATISFIED";
    })(PATRON_MANAGER_EVENTS = Project.PATRON_MANAGER_EVENTS || (Project.PATRON_MANAGER_EVENTS = {}));
    var PatronManager = (function (_super) {
        __extends(PatronManager, _super);
        function PatronManager(scene, x, y) {
            var _this = _super.call(this, scene, x, y) || this;
            _this.patrons = [];
            return _this;
        }
        PatronManager.prototype.updateLayout = function () {
            var cellW = +this.scene.game.config.width / this.list.length;
            Phaser.Actions.GridAlign(this.list, {
                width: this.list.length,
                height: 1,
                cellWidth: cellW,
                cellHeight: 0,
                x: cellW - (cellW * this.list.length * 0.5)
            });
        };
        PatronManager.prototype.update = function (timestamp, elapsed) {
            for (var i = this.patrons.length - 1; i >= 0; i--)
                this.patrons[i].update(timestamp, elapsed);
        };
        PatronManager.prototype.addPatron = function () {
            var patron = new Project.Patron(this.scene, 0, 0);
            patron.once(Project.PATRON_EVENTS.COUNTDOWN_EXPIRED, this.onPatronCountdownExpired, this);
            patron.once(Project.PATRON_EVENTS.SATISFIED, this.onPatronSatisfied, this);
            this.patrons.push(patron);
            this.add(patron);
            this.scene.game.sound.play('doorbell');
            this.updateLayout();
        };
        PatronManager.prototype.removePatron = function (patron) {
            var idx = this.patrons.indexOf(patron);
            if (idx > -1)
                this.patrons.splice(idx, 1);
            patron.destroy();
            this.updateLayout();
        };
        PatronManager.prototype.start = function () {
            this.resetClock();
        };
        PatronManager.prototype.stop = function () {
            while (this.patrons.length)
                this.removePatron(this.patrons.pop());
            this.nextPatronCountdown.remove();
            this.nextPatronCountdown = null;
        };
        PatronManager.prototype.resetClock = function () {
            var nextPatronTime = Phaser.Math.Between(PatronManager.minPatronSpawnTime, PatronManager.maxPatronSpawnTime);
            console.log('nextPatronTime', nextPatronTime);
            this.nextPatronCountdown = this.scene.time.delayedCall(nextPatronTime, this.spawnPatron, null, this);
        };
        PatronManager.prototype.spawnPatron = function () {
            this.resetClock();
            if (this.patrons.length < PatronManager.maxPatrons)
                this.addPatron();
        };
        PatronManager.prototype.onPatronCountdownExpired = function (patron) {
            this.emit(PATRON_MANAGER_EVENTS.PATRON_EXPIRED, this, [patron]);
            this.removePatron(patron);
        };
        PatronManager.prototype.onPatronSatisfied = function (patron) {
            this.emit(PATRON_MANAGER_EVENTS.PATRON_SATISFIED, this, [patron]);
            this.removePatron(patron);
        };
        PatronManager.minPatronSpawnTime = 6000;
        PatronManager.maxPatronSpawnTime = 10000;
        PatronManager.maxPatrons = 3;
        return PatronManager;
    }(Phaser.GameObjects.Container));
    Project.PatronManager = PatronManager;
})(Project || (Project = {}));
var Project;
(function (Project) {
    var CardCollectionScene = (function (_super) {
        __extends(CardCollectionScene, _super);
        function CardCollectionScene() {
            return _super.call(this, { key: 'CardCollectionScene', active: true }) || this;
        }
        CardCollectionScene.prototype.create = function () {
            this.container = this.add.container(0, 0);
            this.cardCollection = new Project.CardCollection(this);
            this.container.add(this.cardCollection);
        };
        return CardCollectionScene;
    }(Phaser.Scene));
    Project.CardCollectionScene = CardCollectionScene;
})(Project || (Project = {}));
var Project;
(function (Project) {
    var PairsActivityScene = (function (_super) {
        __extends(PairsActivityScene, _super);
        function PairsActivityScene() {
            var _this = _super.call(this, { key: 'PairsActivityScene', active: false }) || this;
            _this.comparatorA = null;
            _this.comparatorB = null;
            return _this;
        }
        PairsActivityScene.prototype.create = function () {
            var _this = this;
            this.container = this.add.container(0, 0);
            this.container.add(new Phaser.GameObjects.Sprite(this, +this.game.config.width / 2, +this.game.config.height / 2, 'parts_bg'));
            this.sceneChangeButton = new Phaser.GameObjects.Sprite(this, 0, 0, 'ui', 'scene_up');
            this.sceneChangeButton.setPosition(this.game.config.width * 0.5, (this.sceneChangeButton.height * 0.5) - 30);
            this.sceneChangeButton.setInteractive();
            this.sceneChangeButton.on('pointerup', this.changeActivity, this);
            this.sceneChangeButton.on('pointerover', function () { _this.sceneChangeButton.setScale(1.1); }, this);
            this.sceneChangeButton.on('pointerout', function () { _this.sceneChangeButton.setScale(1); }, this);
            this.container.add(this.sceneChangeButton);
            this.resetActivity();
            this.events.on(Phaser.Scenes.Events.TRANSITION_OUT, this.onTransitionOut, this);
            this.events.on(Phaser.Scenes.Events.TRANSITION_START, this.onTransitionStart, this);
            this.events.on(Phaser.Scenes.Events.TRANSITION_COMPLETE, this.onTransitionComplete, this);
        };
        PairsActivityScene.prototype.resetActivity = function () {
            var nCardsW = 8;
            var nCardsH = 3;
            if ((nCardsW * nCardsH) % 2 != 0)
                throw new Error('Must be an even number of cards!');
            var groupOffsetX = 0;
            var groupOffsetY = -10;
            var tCards = nCardsW * nCardsH;
            var tPairs = tCards / 2;
            var cScale = 0.5;
            var types = [
                Project.CARD_TYPES.CIRCLE,
                Project.CARD_TYPES.COG,
                Project.CARD_TYPES.DROP,
                Project.CARD_TYPES.SEGMENT,
                Project.CARD_TYPES.SQSTAR,
                Project.CARD_TYPES.SQUARE,
                Project.CARD_TYPES.TRAPEZOID,
                Project.CARD_TYPES.TRIANGLE
            ];
            this.cards = [];
            for (var i = 0; i < tPairs; i++) {
                var type = types[i % types.length];
                for (var p = 0; p < 2; p++) {
                    var card = new Project.FlipCard(this, 0, 0, type);
                    card.setScale(cScale);
                    this.cards.push(card);
                    this.container.add(card);
                    card.enable();
                    card.on(Project.FLIP_CARD_EVENTS.DID_PRESS_BACK, this.onCardSelected, this);
                    card.on(Project.FLIP_CARD_EVENTS.DESTROYED, this.onCardDestroy, this);
                    card.on(Project.FLIP_CARD_EVENTS.HOVER_OVER, this.onCardHoverOver, this);
                    card.on(Project.FLIP_CARD_EVENTS.HOVER_OUT, this.onCardHoverOut, this);
                    card.setFaceDown();
                }
            }
            var paddingX = 10;
            var paddingY = 10;
            var nWidth = this.cards[0].width;
            var nHeight = this.cards[0].height;
            var cWidth = nWidth * cScale + paddingX;
            var cHeight = nHeight * cScale + paddingY;
            Phaser.Utils.Array.Shuffle(this.cards);
            Phaser.Actions.GridAlign(this.cards, {
                width: nCardsW,
                height: nCardsH,
                cellWidth: cWidth,
                cellHeight: cHeight,
                x: (+this.game.config.width / 2) - ((cWidth * nCardsW) / 2) + groupOffsetX,
                y: (+this.game.config.height / 2) - ((cHeight * nCardsH) / 2) + groupOffsetY
            });
            for (i = 0; i < this.cards.length; i++)
                this.cards[i].updateAnchor();
        };
        PairsActivityScene.prototype.updateTransitionOut = function (progress) {
            var sceneB = this.scene.get('ShopActivityScene');
            this.container.y = (this.game.config.height * progress);
            sceneB.updateNeighbourPosition(this.container.y);
        };
        Object.defineProperty(PairsActivityScene.prototype, "cardCollection", {
            get: function () {
                var ccScene = this.scene.get('CardCollectionScene');
                return ccScene.cardCollection;
            },
            enumerable: true,
            configurable: true
        });
        PairsActivityScene.prototype.changeActivity = function () {
            this.scene.transition({
                target: 'ShopActivityScene',
                duration: 200,
                onUpdate: this.updateTransitionOut,
                sleep: true
            });
        };
        PairsActivityScene.prototype.isComparatorReady = function () {
            return (this.comparatorA != null && this.comparatorB != null);
        };
        PairsActivityScene.prototype.runComparator = function () {
            if (this.comparatorA.type == this.comparatorB.type) {
                this.collectCardOfType(this.comparatorA.type);
                this.comparatorA.destroy();
                this.comparatorB.destroy();
            }
            else {
                this.game.sound.play('incorrect');
                this.comparatorA.reset();
                this.comparatorB.reset();
            }
            this.comparatorA = this.comparatorB = null;
        };
        PairsActivityScene.prototype.collectCardOfType = function (type) {
            this.game.sound.play('collect');
            this.cardCollection.collectCard(type);
        };
        PairsActivityScene.prototype.onCardSelected = function (card) {
            if (this.isComparatorReady())
                return;
            this.game.sound.play('flip');
            card.flip(true);
            if (this.comparatorA === null)
                this.comparatorA = card;
            else if (this.comparatorB === null)
                this.comparatorB = card;
            if (this.isComparatorReady()) {
                this.game.sound.play('comparator');
                this.time.delayedCall(1000, this.runComparator, null, this);
            }
        };
        PairsActivityScene.prototype.onCardHoverOver = function (card) {
            if (this.isComparatorReady())
                return;
            this.container.bringToTop(card);
            card.raise();
        };
        PairsActivityScene.prototype.onCardHoverOut = function (card) {
            if (this.isComparatorReady())
                return;
            card.lower();
        };
        PairsActivityScene.prototype.onCardDestroy = function (card) {
            var idx = this.cards.indexOf(card);
            if (idx > -1)
                this.cards.splice(idx, 1);
            if (this.cards.length == 0)
                this.resetActivity();
        };
        PairsActivityScene.prototype.onTransitionOut = function () {
            this.game.sound.play('transition');
            this.sceneChangeButton.visible = false;
        };
        PairsActivityScene.prototype.onTransitionStart = function () {
            this.sceneChangeButton.visible = false;
        };
        PairsActivityScene.prototype.onTransitionComplete = function () {
            this.sceneChangeButton.visible = true;
        };
        PairsActivityScene.prototype.updateNeighbourPosition = function (y) {
            this.container.y = y + this.game.config.height;
        };
        return PairsActivityScene;
    }(Phaser.Scene));
    Project.PairsActivityScene = PairsActivityScene;
})(Project || (Project = {}));
var Project;
(function (Project) {
    var Preloader = (function (_super) {
        __extends(Preloader, _super);
        function Preloader() {
            return _super.call(this, { key: 'Preloader', active: false }) || this;
        }
        Preloader.prototype.preload = function () {
            this.load.atlas('cards', 'assets/atlas/cards.png', 'assets/atlas/cards.json');
            this.load.atlas('ui', 'assets/atlas/ui.png', 'assets/atlas/ui.json');
            this.load.spritesheet('portraits', 'assets/portraits.jpg', { frameWidth: 160, frameHeight: 120 });
            this.load.image('shop_bg', 'assets/shop.png');
            this.load.image('parts_bg', 'assets/parts.png');
            this.load.audio('doorbell', 'assets/sfx/doorentry.mp3');
            this.load.audio('music', 'assets/sfx/bensound-badass.mp3');
            this.load.audio('yeah', 'assets/sfx/yeah.mp3');
            this.load.audio('comparator', 'assets/sfx/comparator.mp3');
            this.load.audio('transition', 'assets/sfx/transition.mp3');
            this.load.audio('collect', 'assets/sfx/collect.mp3');
            this.load.audio('incorrect', 'assets/sfx/incorrect.mp3');
            this.load.audio('flip', 'assets/sfx/flip.mp3');
        };
        Preloader.prototype.create = function () {
            this.game.sound.add('music');
            this.game.sound.play('music', { volume: 0.5 });
            this.game.sound.add('doorbell');
            this.game.sound.add('comparator');
            this.game.sound.add('yeah');
            this.game.sound.add('collect');
            this.game.sound.add('transition');
            this.game.sound.add('incorrect');
            this.game.sound.add('flip');
            this.scene.start('TitleScene');
        };
        return Preloader;
    }(Phaser.Scene));
    Project.Preloader = Preloader;
})(Project || (Project = {}));
var Project;
(function (Project) {
    var ShopActivityScene = (function (_super) {
        __extends(ShopActivityScene, _super);
        function ShopActivityScene() {
            var _this = _super.call(this, { key: 'ShopActivityScene', active: false }) || this;
            _this.patronsExpired = 0;
            _this.patronsSatisfied = 0;
            return _this;
        }
        ShopActivityScene.prototype.create = function () {
            var _this = this;
            this.container = this.add.container(0, 0);
            this.container.add(new Phaser.GameObjects.Sprite(this, +this.game.config.width / 2, +this.game.config.height / 2, 'shop_bg'));
            this.sceneChangeButton = new Phaser.GameObjects.Sprite(this, 0, 0, 'ui', 'scene_down');
            this.sceneChangeButton.setPosition(+this.game.config.width * 0.5, (+this.game.config.height - this.sceneChangeButton.height * 0.5) + 30);
            this.sceneChangeButton.setInteractive();
            this.sceneChangeButton.on('pointerup', this.changeActivity, this);
            this.sceneChangeButton.on('pointerover', function () { _this.sceneChangeButton.setScale(1.1); }, this);
            this.sceneChangeButton.on('pointerout', function () { _this.sceneChangeButton.setScale(1); }, this);
            this.container.add(this.sceneChangeButton);
            this.patronManager = new Project.PatronManager(this, (+this.game.config.width / 2), (+this.game.config.height / 2) - 160);
            this.patronManager.on(Project.PATRON_MANAGER_EVENTS.PATRON_EXPIRED, this.onPatronExpired, this);
            this.container.add(this.patronManager);
            this.patronManager.start();
            this.patronManager.addPatron();
            this.cardCollection.enableDragDrop();
            this.events.on(Phaser.Scenes.Events.TRANSITION_OUT, this.onTransitionOut, this);
            this.events.on(Phaser.Scenes.Events.TRANSITION_COMPLETE, this.onTransitionComplete, this);
            this.events.on(Phaser.Scenes.Events.TRANSITION_START, this.onTransitionStart, this);
        };
        ShopActivityScene.prototype.update = function (timestamp, elapsed) {
            this.patronManager.update(timestamp, elapsed);
        };
        ShopActivityScene.prototype.checkEndGame = function () {
            if (this.patronsExpired >= ShopActivityScene.gameOverAfterExpiredPatrons)
                this.gameOver();
        };
        ShopActivityScene.prototype.gameOver = function () {
            this.patronManager.stop();
            alert('GAME OVER!');
        };
        ShopActivityScene.prototype.updateTransitionOut = function (progress) {
            var sceneB = this.scene.get('PairsActivityScene');
            this.container.y = (-this.game.config.height * progress);
            sceneB.updateNeighbourPosition(this.container.y);
        };
        ShopActivityScene.prototype.changeActivity = function () {
            this.scene.transition({
                target: 'PairsActivityScene',
                duration: 200,
                onUpdate: this.updateTransitionOut,
                sleep: true
            });
        };
        Object.defineProperty(ShopActivityScene.prototype, "cardCollection", {
            get: function () {
                var ccScene = this.scene.get('CardCollectionScene');
                return ccScene.cardCollection;
            },
            enumerable: true,
            configurable: true
        });
        ShopActivityScene.prototype.onTransitionOut = function () {
            this.game.sound.play('transition');
            this.cardCollection.disableDragDrop();
            this.sceneChangeButton.visible = false;
        };
        ShopActivityScene.prototype.onTransitionStart = function () {
            this.sceneChangeButton.visible = false;
        };
        ShopActivityScene.prototype.onTransitionComplete = function () {
            this.cardCollection.enableDragDrop();
            this.sceneChangeButton.visible = true;
        };
        ShopActivityScene.prototype.onPatronExpired = function () {
            this.patronsExpired++;
            console.log('patron expired!', this.patronsExpired);
            this.checkEndGame();
        };
        ShopActivityScene.prototype.onPatronSatisfied = function () {
            this.patronsSatisfied++;
            console.log('patron satisfied!', this.patronsSatisfied);
        };
        ShopActivityScene.prototype.updateNeighbourPosition = function (y) {
            this.container.y = y - this.game.config.height;
        };
        ShopActivityScene.gameOverAfterExpiredPatrons = 1;
        return ShopActivityScene;
    }(Phaser.Scene));
    Project.ShopActivityScene = ShopActivityScene;
})(Project || (Project = {}));
var Project;
(function (Project) {
    var TitleScene = (function (_super) {
        __extends(TitleScene, _super);
        function TitleScene() {
            return _super.call(this, { key: 'TitleScene', active: false }) || this;
        }
        TitleScene.prototype.create = function () {
            this.container = this.add.container(0, 0);
            this.container.add(new Phaser.GameObjects.Sprite(this, +this.game.config.width / 2, +this.game.config.height / 2, 'parts_bg'));
            var playButton = new Phaser.GameObjects.Sprite(this, 0, 0, 'ui', 'playbutt');
            playButton.setPosition(+this.game.config.width * 0.5, (+this.game.config.height - playButton.height * 0.5) + 20);
            playButton.setInteractive();
            playButton.on('pointerup', this.changeActivity, this);
            playButton.on('pointerover', function () { playButton.setScale(1.1); }, this);
            playButton.on('pointerout', function () { playButton.setScale(1); }, this);
            this.container.add(playButton);
        };
        TitleScene.prototype.changeActivity = function () {
            this.scene.start('ShopActivityScene');
        };
        return TitleScene;
    }(Phaser.Scene));
    Project.TitleScene = TitleScene;
})(Project || (Project = {}));
//# sourceMappingURL=game.js.map