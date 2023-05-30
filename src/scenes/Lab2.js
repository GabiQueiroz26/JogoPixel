import { Scene } from "phaser";
import { CONFIG } from "../config";
import HUD from "../entities/HUD";

//pesquisar sobre 9-slice

export default class Lab2 extends Scene {

    /** @type {Phaser.Tilemaps.Tilemap} */
    map;

    layers = {};

    hud;

    spaceDown = false;

    constructor() {
        super("Lab2");
    }

    preload(){

        //Carregando os dados do mapa
        this.load.tilemapTiledJSON('tilemap-lab-info', 'mapas/lab_info1.json');

        //caregando os tilessets do mapa IMAGENS
        this.load.image('tiles-office', 'mapas/tiles/tiles_office.png');

        //mapa pra dizer onde fica as coisas
        this.load.atlas('hud','mapas/tiles/hud.png', 'mapas/tiles/hud.json');

        

    }

    create(){
        this.cursors = this.input.keyboard.createCursorKeys();

        this.createMap();
        this.createLayers();

        this.hud = new HUD(this, 0 ,0);
        this.hud.showDialog('Este é o texto que deve aparecer na caixa de diálogo, coloque um texto grande aqui para que ele use varias linhas');
        
    }

    update() {
        const { space } = this.cursors;

        if( space.isDown && !this.spaceDown){
            this.spaceDown = true;
            this.hud.showDialog('Este é o texto que deve aparecer na caixa de diálogo, coloque um texto grande aqui para que ele use varias linhas');
        } else if( !space.isDown && this.spaceDown) {
            this.spaceDown = false;
        }
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

    createLayers() {
        //Pegando os tilesets (usar os nomes do Tiled)
        const tilesOffice = this.map.getTileset('office');

        const layerNames = this.map.getTileLayerNames();
        for (let i = 0; i < layerNames.length; i++) {
            const name = layerNames[i];

            this.layers[name] = this.map.createLayer(name, [tilesOffice], 0, 0);
            // Definindo a profundidade  de cada camada
            this.layers[name].setDepth( i );

            
        }
    
    }
   

}
