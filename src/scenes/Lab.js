import { Scene } from "phaser";
import { CONFIG } from "../config";
import Player from "../entities/Player";
import Touch from "../entities/Touch";
import Dialog from "../entities/Dialog";

export default class Lab extends Scene {

    /**@type {Phaser.Tilemaps.Tilemap} */
    map;

    layers = {};

    /** @type {Player} */
    player;

    touch;

    /** @type {Phaser.Physics.Arcade.Group} */
    groupObjects;

    /** @type {Phaser.Physics.Arcade.Sprite} */
    groupObjects;


    isTouching = false;

    constructor() {
        super('Lab'); // Salvando o nome desta Cena
    }

    preload() {
        // Carregar os dados do mapa
        this.load.tilemapTiledJSON('tilemap-lab-info', 'mapas/lab_info1.json');

        // Carregar os tilesets do map (as imagens)
        this.load.image('tiles-office', 'mapas/tiles/tiles_office.png');

        //Importando um spritesheet
        this.load.spritesheet('player', 'mapas/tiles/Gabi.png', {
            frameWidth: CONFIG.TILE_SIZE,
            frameHeight: CONFIG.TILE_SIZE * 2
        })

        this.load.spritesheet('lixeira', 'mapas/tiles/lixeiras_spritesheet.png', {
            frameWidth: CONFIG.TILE_SIZE,
            frameHeight: CONFIG.TILE_SIZE * 2
        })

        this.load.image('placa', 'mapas/tiles/placa.png');
    }

    create(){
        this.createMap();
        this.createLayers();
        this.createPlayer();
        this.createObjects();
        this.createColliders();
        this.createCamera();

       
    }

    update(){
        
    }

    createPlayer() {
        this.touch = new Touch(this, 16*8, 16*5);

        this.player = new Player(this, 16*8, 16*5, this.touch);
        this.player.setDepth( 2 );

       
    }

    createMap() {
        this.map = this.make.tilemap({
            key: 'tilemap-lab-info',
            tileWidth: CONFIG.TILE_SIZE,
            tileHeight: CONFIG.TILE_SIZE
        });

        //Fazendo a correspondencia entre as imagens usadas no Tiled
        // e as carregadas pelo Phaser
        this.map.addTilesetImage('office', 'tiles-office');

    }

    // Automatizando
    createLayers() {
        //Pegando os tilesets (usar os nomes do Tiled)
        const tilesOffice = this.map.getTileset('office');

        const layerNames = this.map.getTileLayerNames();
        for (let i = 0; i < layerNames.length; i++) {
            const name = layerNames[i];

            this.layers[name] = this.map.createLayer(name, [tilesOffice], 0, 0);
            // Definindo a profundidade  de cada camada
            this.layers[name].setDepth( i );

            // Verificando se o layer possui colisão
            if ( name.endsWith('Collision') ) {
                this.layers[name].setCollisionByProperty({ collide: true });

                if ( CONFIG.DEBUG_COLLISION ) {
                    const debugGraphics = this.add.graphics().setAlpha(0.75).setDepth(i);
                    this.layers[name].renderDebug(debugGraphics, {
                        tileColor: null, // Color of non-colliding tiles
                       // collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
                        //faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
                    });
                }
            }
        }
    
    }

    createObjects() {
        // Criar um grupo para os objetos
        this.groupObjects = this.physics.add.group();

        const objects = this.map.createFromObjects( "Objeto", "Objeto", "Objeto",  {
            name: "Cadeira", name: "LixeiraLaranja", name: "LixeiraAzul", name: "Panfleto1", name: "Panfleto2"
        
        });
        

        // Tornando todos os objetos, Sprites com Physics (que possuem body)
        this.physics.world.enable(objects);

        for(let i = 0; i < objects.length; i++){
            //Pegando o objeto atual
            const obj = objects[i];
            //Pegando as informações do Objeto definidas no Tiled
            const prop = this.map.objects[0].objects[i];
            

            obj.setDepth(this.layers.length + 1);
            obj.setVisible(false);
            obj.prop = this.map.objects[0].objects[i].properties;

            console.log(obj.x, obj.y);

            this.groupObjects.add(obj);
        }
    }

    createLayersManual() {
        const tilesOffice = this.map.getTileset('office');

        this.map.createLayer('Abaixo', [tilesOffice], 0, 0);
        this.map.createLayer('Nivel Abaixo 1', [tilesOffice], 0, 0);
        this.map.createLayer('Nivel Abaixo 2', [tilesOffice], 0, 0);
        this.map.createLayer('Nivel Acima 1', [tilesOffice], 0, 0);
        this.map.createLayer('Nivel Acima 2', [tilesOffice], 0, 0);
    }

    createCamera() {
        const mapWidht = this.map.width * CONFIG.TILE_SIZE;
        const mapHeight = this.map.height * CONFIG.TILE_SIZE;

        this.cameras.main.setBounds(0,0, mapWidht, mapHeight);
        this.cameras.main.startFollow(this.player);
    }

    createColliders() {
        // Diferença COLIDER x OVERLAP
        // COLLIDER: colide e impede a passagem
        // Overlap: detecta a sobreposição dos elementos, não impede a passagem

        // Criando colisão entre o player e as camadas de colisão do Tiled
        const layerNames = this.map.getTileLayerNames();
        for (let i = 0; i < layerNames.length; i++) {
            const name = layerNames[i];

            if( name.endsWith('Collision')) {
                this.physics.add.collider(this.player, this.layers[name]);
            }
        }

        
        //Criar colisão entre a "Maozinha" do Player e os objetos da camada de objetos da camada de Objetos
        // Chama a função this.handleTouch toda vez que o this.touch entrar em contato com um objeto do this.groupObjects
        this.physics.add.overlap(this.touch, this.groupObjects, this.handleTouch, undefined, this);
    }

    createLixeiras() {

    }

 

    handleTouch(touch, object) {
        if(this.isTouching && this.player.isAction){

            return;
        }

        if (this.isTouching && !this.player.isAction){
            this.isTouching = false;
            return;
        }

        if(this.player.isAction) {
            this.isTouching = true;
            if(object.name == "Cadeira"){
                if (this.player.body.enable == true) {
                    this.player.body.enable = false;
                    this.player.x = object.x - 8;
                    this.player.y = object.y - 8;
                    this.player.direction = 'up';
                    this.player.setDepth(0);
         
                    
                } else {
                    this.player.body.enable = true;
                    this.player.x = object.x + 8;
                    this.player.y = object.y + 8;
                    this.player.direction = 'up';
                    this.player.setDepth(4);
                }
            }

        }

        if(this.player.isAction) {
            this.isTouching = true;
            if(object.name == "LixeiraLaranja"){

                if (this.player.body.enable == true) {
                    this.player.body.enable = false;
                    var lixeira1 = this.add.sprite(345, 48, 'lixeira', 1);
              }  else {
                    this.player.body.enable = true
                        var lixeira2 = this.add.sprite(345, 48, 'lixeira', 0);
    
                }
            }

            if(this.player.isAction) {
                this.isTouching = true;
                if(object.name == "LixeiraAzul"){
    
                    if (this.player.body.enable == true) {
                        this.player.body.enable = false;
                        var lixeira3 = this.add.sprite(360, 48, 'lixeira', 5);
                        
    
                    }  else {
                        this.player.body.enable = true
                        var lixeira4 = this.add.sprite(360, 48, 'lixeira', 3);
        
                    }
                }
    


                
            if(object.name == "Panfleto1"){
                if(this.player.body.enable == true){
                    const dialog = new Dialog(this, 150, 150, 'Proibido alimentos e bebidas nesse local 🥤');
                    dialog.setVisible(true);
                } 
            }

            if(object.name == "Panfleto2"){
                if(this.player.body.enable == true){
                    const dialog = new Dialog(this, 150, 150, 'Proibido o uso de aparelhos eletronicos nesse local 📱');
                    dialog.setVisible(true);
                } 
            }

            if (this.player.isAction){
                this.isTouching = true;
                if(object.name == 'Quadro'){
                    const dialog = new Dialog(this, 150, 150, 'Programação por amor ❤️')
                    dialog.setVisible(true)
                }
            }

        }


        
    }
}

}