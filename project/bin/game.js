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
            this.input.on('pointerdown', function () {
                this.input.stopPropagation();
                this.scene.transition({
                    target: 'ShopActivityScene',
                    duration: 750,
                    onUpdate: this.transitionOut
                });
            }, this);
        };
        PairsActivityScene.prototype.preload = function () {
            this.load.atlas('cards', 'assets/atlas/cards.png', 'assets/atlas/cards.json');
        };
        PairsActivityScene.prototype.transitionOut = function (progress) {
            var sceneB = this.scene.get('ShopActivityScene');
            this.container.y = (600 * progress);
            sceneB.updateNeighbourPosition(this.container.y);
        };
        PairsActivityScene.prototype.updateNeighbourPosition = function (y) {
            this.container.y = y + (+this.game.config.height);
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
            this.input.on('pointerdown', function () {
                this.input.stopPropagation();
                this.scene.transition({
                    target: 'PairsActivityScene',
                    duration: 750,
                    onUpdate: this.transitionOut
                });
            }, this);
        };
        ShopActivityScene.prototype.preload = function () {
            this.load.atlas('cards', 'assets/atlas/cards.png', 'assets/atlas/cards.json');
        };
        ShopActivityScene.prototype.transitionOut = function (progress) {
            var sceneB = this.scene.get('PairsActivityScene');
            this.container.y = (-600 * progress);
            sceneB.updateNeighbourPosition(this.container.y);
        };
        ShopActivityScene.prototype.updateNeighbourPosition = function (y) {
            this.container.y = y - (+this.game.config.height);
        };
        return ShopActivityScene;
    }(Phaser.Scene));
    Project.ShopActivityScene = ShopActivityScene;
})(Project || (Project = {}));
//# sourceMappingURL=game.js.map