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
                backgroundColor: '#ffffff',
                scene: [Project.Preloader, Project.ShopActivityScene, Project.PairsActivityScene, Project.CardCollectionScene]
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
    var CardFace;
    (function (CardFace) {
        CardFace["FRONT"] = "front";
        CardFace["BACK"] = "back";
    })(CardFace = Project.CardFace || (Project.CardFace = {}));
    var CARD_EVENTS;
    (function (CARD_EVENTS) {
        CARD_EVENTS["DESTROYED"] = "DESTROYED";
        CARD_EVENTS["DID_PRESS_FRONT"] = "DID_PRESS_FRONT";
        CARD_EVENTS["DID_PRESS_BACK"] = "DID_PRESS_BACK";
        CARD_EVENTS["WILL_SHOW_FRONT"] = "WILL_SHOW_FRONT";
        CARD_EVENTS["WILL_SHOW_BACK"] = "WILL_SHOW_BACK";
        CARD_EVENTS["HOVER_OVER"] = "HOVER_OVER";
        CARD_EVENTS["HOVER_OUT"] = "HOVER_OUT";
    })(CARD_EVENTS = Project.CARD_EVENTS || (Project.CARD_EVENTS = {}));
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
    var Card = (function (_super) {
        __extends(Card, _super);
        function Card(scene, x, y, frontFrame) {
            var _this = _super.call(this, scene, x, y, Card.atlasName, frontFrame) || this;
            _this.anchorX = 0;
            _this.anchorY = 0;
            _this.anchorScale = 1;
            _this.anchorRotation = 0;
            _this.frontFrame = frontFrame;
            _this.backFrame = Card.backFrame;
            _this.setOrigin(0.5);
            _this.on('pointerup', function (pointer) {
                switch (_this.frame.name) {
                    case _this.backFrame:
                        _this.emit(CARD_EVENTS.DID_PRESS_BACK, _this);
                        break;
                }
            }, _this);
            _this.on('pointerover', function (pointer) {
                switch (_this.frame.name) {
                    case _this.backFrame:
                        _this.emit(CARD_EVENTS.HOVER_OVER, _this);
                        break;
                }
            }, _this);
            _this.on('pointerout', function (pointer) {
                switch (_this.frame.name) {
                    case _this.backFrame:
                        _this.emit(CARD_EVENTS.HOVER_OUT, _this);
                        break;
                }
            }, _this);
            return _this;
        }
        Card.prototype.destroy = function (fromScene) {
            this.emit(CARD_EVENTS.DESTROYED, this);
            _super.prototype.destroy.call(this, fromScene);
        };
        Card.prototype.enable = function () {
            this.setInteractive();
        };
        Card.prototype.disable = function () {
            this.disableInteractive();
        };
        Card.prototype.flip = function (animated) {
            if (animated === void 0) { animated = true; }
            if (this.frame.name == this.frontFrame)
                this.showFace(CardFace.BACK);
            else if (this.frame.name == this.backFrame)
                this.showFace(CardFace.FRONT);
        };
        Card.prototype.showFace = function (face, animated) {
            if (animated === void 0) { animated = true; }
            switch (face) {
                case CardFace.FRONT:
                    this.emit(CARD_EVENTS.WILL_SHOW_FRONT, this);
                    this.setFrame(this.frontFrame);
                    break;
                case CardFace.BACK:
                    this.emit(CARD_EVENTS.WILL_SHOW_BACK, this);
                    this.setFrame(this.backFrame);
                    break;
            }
        };
        Card.prototype.setFaceUp = function () {
            this.showFace(CardFace.FRONT);
        };
        Card.prototype.setFaceDown = function () {
            this.showFace(CardFace.BACK);
        };
        Card.prototype.raise = function () {
            this.rotation = this.anchorRotation + ((2 * Math.PI) / 360) * Phaser.Math.Between(-10, 10);
            this.setScale(this.anchorScale + 0.1);
        };
        Card.prototype.lower = function () {
            this.reset();
        };
        Card.prototype.reset = function () {
            this.setFaceDown();
            this.rotation = this.anchorRotation;
            this.setScale(this.anchorScale);
        };
        Card.prototype.updateAnchor = function () {
            this.anchorX = this.x;
            this.anchorY = this.y;
            this.anchorScale = this.scale;
            this.anchorRotation = this.rotation;
            this.reset();
        };
        Card.atlasName = 'cards';
        Card.backFrame = 'back';
        return Card;
    }(Phaser.GameObjects.Sprite));
    Project.Card = Card;
})(Project || (Project = {}));
var Project;
(function (Project) {
    var CardCollection = (function (_super) {
        __extends(CardCollection, _super);
        function CardCollection(scene, x, y) {
            var _this = _super.call(this, scene, x, y) || this;
            _this.stacksByType = {};
            _this.nStacks = 0;
            return _this;
        }
        CardCollection.prototype.updateLayout = function () {
            var i = 0;
            var nWidth = 110;
            for (var key in this.stacksByType) {
                if (this.stacksByType.hasOwnProperty(key)) {
                    var stack = this.stacksByType[key];
                    var cWidth = stack.getAt(0).width;
                    var cHeight = stack.getAt(0).height * 0.2;
                    Phaser.Actions.GridAlign(stack.list, {
                        width: 1,
                        height: stack.list.length,
                        cellWidth: cWidth,
                        cellHeight: cHeight
                    });
                    stack.iterate(function (child) {
                        child.angle = Phaser.Math.Between(-10, 10);
                    });
                    stack.x = (nWidth * i);
                    stack.y = 0;
                    i++;
                }
            }
            this.x = (+this.scene.game.config.width / 2) - (nWidth * 0.5 * (this.nStacks - 1));
            this.y = (+this.scene.game.config.height) - 100;
        };
        CardCollection.prototype.collect = function (card) {
            var stack = this.stacksByType[card.frame.name];
            if (!stack) {
                this.stacksByType[card.frame.name] = stack = new Phaser.GameObjects.Container(this.scene);
                this.add(stack);
                this.nStacks++;
            }
            stack.add(card);
            this.updateLayout();
        };
        return CardCollection;
    }(Phaser.GameObjects.Container));
    Project.CardCollection = CardCollection;
})(Project || (Project = {}));
var Project;
(function (Project) {
    var Patron = (function (_super) {
        __extends(Patron, _super);
        function Patron(scene, x, y) {
            var _this = _super.call(this, scene, x, y) || this;
            _this.request = [];
            _this.requestIcons = [];
            _this.portrait = new Phaser.GameObjects.Sprite(scene, 0, 0, 'portraits', 0);
            _this.portrait.setScale(1.5);
            _this.add(_this.portrait);
            _this.requestIconContainer = new Phaser.GameObjects.Container(scene, 0, 0);
            _this.add(_this.requestIconContainer);
            _this.pickRandomFrame();
            _this.generateRequest();
            return _this;
        }
        Patron.prototype.pickRandomFrame = function () {
            this.portrait.setFrame(Phaser.Math.Between(0, Patron.nFrames));
            this.updateLayout();
        };
        Patron.prototype.updateLayout = function () {
            this.requestIconContainer.x = this.portrait.x - this.requestIconContainer.width * 0.5;
            this.requestIconContainer.y = this.portrait.y + this.portrait.height;
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
            var cWidth = 50;
            Phaser.Actions.GridAlign(this.requestIcons, {
                width: this.requestIcons.length,
                height: 1,
                cellWidth: cWidth,
                cellHeight: 0
            });
            this.updateLayout();
        };
        Patron.prototype.generateRequest = function () {
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
                if (Math.random() > 0.8 || (this.request.length >= 5))
                    escape = true;
            }
            this.updateRequestView();
        };
        Patron.prototype.deliverCard = function (type) {
            var idx = this.request.indexOf(type);
            if (idx > -1) {
                this.request.splice(idx, 1);
                this.updateRequestView();
            }
            if (this.request.length == 0)
                this.patronSatisfied();
        };
        Patron.prototype.patronSatisfied = function () {
            alert('satisfied');
        };
        Patron.nFrames = 107;
        return Patron;
    }(Phaser.GameObjects.Container));
    Project.Patron = Patron;
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
            this.container = this.add.container(0, 0);
            this.sceneChangeButton = new Phaser.GameObjects.Sprite(this, 0, 0, 'ui', 'scene_up');
            this.sceneChangeButton.setPosition(this.game.config.width * 0.5, this.sceneChangeButton.height * 0.5);
            this.sceneChangeButton.setInteractive();
            this.sceneChangeButton.on('pointerup', this.changeActivity, this);
            this.container.add(this.sceneChangeButton);
            this.resetActivity();
            this.events.on(Phaser.Scenes.Events.TRANSITION_OUT, this.onTransitionOut, this);
            this.events.on(Phaser.Scenes.Events.TRANSITION_START, this.onTransitionStart, this);
            this.events.on(Phaser.Scenes.Events.TRANSITION_COMPLETE, this.onTransitionComplete, this);
        };
        PairsActivityScene.prototype.resetActivity = function () {
            var nCardsW = 10;
            var nCardsH = 4;
            var groupOffsetX = 0;
            var groupOffsetY = -40;
            var tCards = nCardsW * nCardsH;
            var tPairs = tCards / 2;
            var cScale = 0.5;
            var frames = [
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
                var pairFrame = frames[i % frames.length];
                for (var p = 0; p < 2; p++) {
                    var card = new Project.Card(this, 0, 0, pairFrame);
                    card.setScale(cScale);
                    this.cards.push(card);
                    this.container.add(card);
                    card.enable();
                    card.on(Project.CARD_EVENTS.DID_PRESS_BACK, this.onCardSelected, this);
                    card.on(Project.CARD_EVENTS.DESTROYED, this.onCardDestroy, this);
                    card.on(Project.CARD_EVENTS.HOVER_OVER, this.onCardHoverOver, this);
                    card.on(Project.CARD_EVENTS.HOVER_OUT, this.onCardHoverOut, this);
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
                duration: 250,
                onUpdate: this.updateTransitionOut,
                sleep: true
            });
        };
        PairsActivityScene.prototype.isComparatorReady = function () {
            return (this.comparatorA != null && this.comparatorB != null);
        };
        PairsActivityScene.prototype.runComparator = function () {
            if (this.comparatorA.frame.name == this.comparatorB.frame.name) {
                this.collectCardOfType(this.comparatorA.frame.name);
                this.comparatorA.destroy();
                this.comparatorB.destroy();
            }
            else {
                this.comparatorA.reset();
                this.comparatorB.reset();
            }
            this.comparatorA = this.comparatorB = null;
        };
        PairsActivityScene.prototype.collectCardOfType = function (type) {
            var c = new Project.Card(this, 0, 0, type);
            this.cardCollection.collect(c);
        };
        PairsActivityScene.prototype.onCardSelected = function (card) {
            if (this.isComparatorReady())
                return;
            card.flip(true);
            if (this.comparatorA === null)
                this.comparatorA = card;
            else if (this.comparatorB === null)
                this.comparatorB = card;
            if (this.isComparatorReady())
                this.time.delayedCall(1000, this.runComparator, null, this);
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
        };
        Preloader.prototype.create = function () {
            this.scene.start('ShopActivityScene');
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
            return _super.call(this, { key: 'ShopActivityScene', active: false }) || this;
        }
        ShopActivityScene.prototype.create = function () {
            this.container = this.add.container(0, 0);
            this.sceneChangeButton = new Phaser.GameObjects.Sprite(this, 0, 0, 'ui', 'scene_down');
            this.sceneChangeButton.setPosition(this.game.config.width * 0.5, this.sceneChangeButton.height * 0.5);
            this.sceneChangeButton.setInteractive();
            this.sceneChangeButton.on('pointerup', this.changeActivity, this);
            this.container.add(this.sceneChangeButton);
            var patron = new Project.Patron(this, +this.game.config.width / 2, (+this.game.config.height / 2) - 150);
            this.container.add(patron);
            this.events.on(Phaser.Scenes.Events.TRANSITION_OUT, this.onTransitionOut, this);
            this.events.on(Phaser.Scenes.Events.TRANSITION_COMPLETE, this.onTransitionComplete, this);
            this.events.on(Phaser.Scenes.Events.TRANSITION_START, this.onTransitionStart, this);
        };
        ShopActivityScene.prototype.updateTransitionOut = function (progress) {
            var sceneB = this.scene.get('PairsActivityScene');
            this.container.y = (-this.game.config.height * progress);
            sceneB.updateNeighbourPosition(this.container.y);
        };
        ShopActivityScene.prototype.changeActivity = function () {
            this.scene.transition({
                target: 'PairsActivityScene',
                duration: 250,
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
            this.sceneChangeButton.visible = false;
        };
        ShopActivityScene.prototype.onTransitionStart = function () {
            this.sceneChangeButton.visible = false;
        };
        ShopActivityScene.prototype.onTransitionComplete = function () {
            this.sceneChangeButton.visible = true;
        };
        ShopActivityScene.prototype.updateNeighbourPosition = function (y) {
            this.container.y = y - this.game.config.height;
        };
        return ShopActivityScene;
    }(Phaser.Scene));
    Project.ShopActivityScene = ShopActivityScene;
})(Project || (Project = {}));
//# sourceMappingURL=game.js.map