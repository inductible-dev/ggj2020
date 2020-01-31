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
    var PairsActivityScene = (function (_super) {
        __extends(PairsActivityScene, _super);
        function PairsActivityScene() {
            return _super.call(this, { key: 'PairsActivityScene', active: false }) || this;
        }
        PairsActivityScene.prototype.create = function () {
            this.container = this.add.container(0, 0);
            this.sceneChangeButton = new Phaser.GameObjects.Sprite(this, 0, 0, 'ui', 'scene_up');
            this.sceneChangeButton.setPosition(this.game.config.width * 0.5, this.sceneChangeButton.height * 0.5);
            this.sceneChangeButton.setInteractive();
            this.sceneChangeButton.on('pointerup', this.changeActivity, this);
            this.container.add(this.sceneChangeButton);
            var x = 100;
            var y = 100;
            for (var i = 0; i < 6; i++) {
                var image = new Phaser.GameObjects.Sprite(this, x, y, 'cards', 'triangle');
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
            this.events.on(Phaser.Scenes.Events.TRANSITION_START, this.onTransitionStart, this);
            this.events.on(Phaser.Scenes.Events.TRANSITION_COMPLETE, this.onTransitionComplete, this);
        };
        PairsActivityScene.prototype.preload = function () {
            this.load.atlas('cards', 'assets/atlas/cards.png', 'assets/atlas/cards.json');
            this.load.atlas('ui', 'assets/atlas/ui.png', 'assets/atlas/ui.json');
        };
        PairsActivityScene.prototype.updateTransitionOut = function (progress) {
            var sceneB = this.scene.get('ShopActivityScene');
            this.container.y = (this.game.config.height * progress);
            sceneB.updateNeighbourPosition(this.container.y);
        };
        PairsActivityScene.prototype.changeActivity = function () {
            this.scene.transition({
                target: 'ShopActivityScene',
                duration: 500,
                onUpdate: this.updateTransitionOut,
                sleep: true
            });
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
                duration: 500,
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