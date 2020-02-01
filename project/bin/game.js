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
                backgroundColor: '#222222',
                scene: [Project.ShopActivityScene, Project.PairsActivityScene]
            }) || this;
            _this.scene.start('ShopActivityScene');
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
    })(CardFace || (CardFace = {}));
    var Card = (function (_super) {
        __extends(Card, _super);
        function Card(scene, x, y, frontFrame) {
            var _this = _super.call(this, scene, x, y, Card.atlasName, frontFrame) || this;
            _this.frontFrame = frontFrame;
            _this.backFrame = Card.backFrame;
            _this.on('pointerup', function (pointer) {
                _this.emit('clicked', _this);
            }, _this);
            return _this;
        }
        Card.prototype.destroy = function (fromScene) {
            this.emit('destroyed', this);
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
                    this.setFrame(this.frontFrame);
                    break;
                case CardFace.BACK:
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
        Card.atlasName = 'cards';
        Card.backFrame = 'back';
        return Card;
    }(Phaser.GameObjects.Sprite));
    Project.Card = Card;
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
            this.initPairsGrid();
            this.events.on(Phaser.Scenes.Events.TRANSITION_OUT, this.onTransitionOut, this);
            this.events.on(Phaser.Scenes.Events.TRANSITION_START, this.onTransitionStart, this);
            this.events.on(Phaser.Scenes.Events.TRANSITION_COMPLETE, this.onTransitionComplete, this);
        };
        PairsActivityScene.prototype.preload = function () {
            this.load.atlas('cards', 'assets/atlas/cards.png', 'assets/atlas/cards.json');
            this.load.atlas('ui', 'assets/atlas/ui.png', 'assets/atlas/ui.json');
        };
        PairsActivityScene.prototype.initPairsGrid = function () {
            var nCardsW = 10;
            var nCardsH = 4;
            var tCards = nCardsW * nCardsH;
            var tPairs = tCards / 2;
            var cScale = 0.5;
            var frames = ['triangle', 'circle', 'cog', 'drop', 'trapezoid', 'segment', 'sqstar', 'square'];
            this.cards = [];
            for (var i = 0; i < tPairs; i++) {
                var pairFrame = frames[i % frames.length];
                for (var p = 0; p < 2; p++) {
                    var card = new Project.Card(this, 0, 0, pairFrame);
                    card.setScale(cScale);
                    this.cards.push(card);
                    this.container.add(card);
                    card.enable();
                    card.on('clicked', this.onCardSelected, this);
                    card.on('destroyed', this.onCardDestroy, this);
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
                x: (+this.game.config.width / 2) - ((cWidth * nCardsW) / 2),
                y: (+this.game.config.height / 2) - ((cHeight * nCardsH) / 2)
            });
        };
        PairsActivityScene.prototype.updateTransitionOut = function (progress) {
            var sceneB = this.scene.get('ShopActivityScene');
            this.container.y = (this.game.config.height * progress);
            sceneB.updateNeighbourPosition(this.container.y);
        };
        PairsActivityScene.prototype.changeActivity = function () {
            this.scene.transition({
                target: 'ShopActivityScene',
                duration: 250,
                onUpdate: this.updateTransitionOut,
                sleep: true
            });
        };
        PairsActivityScene.prototype.runComparator = function () {
            if (this.comparatorA.frame.name == this.comparatorB.frame.name) {
                this.comparatorA.destroy();
                this.comparatorB.destroy();
            }
            else {
                this.comparatorA.setFaceDown();
                this.comparatorB.setFaceDown();
            }
            this.comparatorA = this.comparatorB = null;
        };
        PairsActivityScene.prototype.onCardSelected = function (card) {
            card.flip(true);
            if (this.comparatorA === null)
                this.comparatorA = card;
            else if (this.comparatorB === null) {
                this.comparatorB = card;
                this.runComparator();
            }
        };
        PairsActivityScene.prototype.onCardDestroy = function (card) {
            var idx = this.cards.indexOf(card);
            if (idx > -1)
                this.cards.splice(idx, 1);
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
    var ShopActivityScene = (function (_super) {
        __extends(ShopActivityScene, _super);
        function ShopActivityScene() {
            return _super.call(this, { key: 'ShopActivityScene', active: false }) || this;
        }
        ShopActivityScene.prototype.create = function () {
            this.container = this.add.container(0, 0);
            this.sceneChangeButton = new Phaser.GameObjects.Sprite(this, 0, 0, 'ui', 'scene_down');
            this.sceneChangeButton.setPosition(this.game.config.width * 0.5, this.game.config.height - this.sceneChangeButton.height * 0.5);
            this.sceneChangeButton.setInteractive();
            this.sceneChangeButton.on('pointerup', this.changeActivity, this);
            this.container.add(this.sceneChangeButton);
            var x = 100;
            var y = 100;
            for (var i = 0; i < 6; i++) {
                var image = new Phaser.GameObjects.Sprite(this, x, y, 'cards', 'back');
                this.container.add(image);
                image.setInteractive();
                this.input.setDraggable(image);
                x += 4;
                y += 4;
            }
            this.input.on('drag', function (pointer, gameObject, dragX, dragY) {
                gameObject.x = dragX;
                gameObject.y = dragY;
            });
            this.events.on(Phaser.Scenes.Events.TRANSITION_OUT, this.onTransitionOut, this);
            this.events.on(Phaser.Scenes.Events.TRANSITION_COMPLETE, this.onTransitionComplete, this);
            this.events.on(Phaser.Scenes.Events.TRANSITION_START, this.onTransitionStart, this);
        };
        ShopActivityScene.prototype.preload = function () {
            this.load.atlas('cards', 'assets/atlas/cards.png', 'assets/atlas/cards.json');
            this.load.atlas('ui', 'assets/atlas/ui.png', 'assets/atlas/ui.json');
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