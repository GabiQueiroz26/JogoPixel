import Phaser from "phaser";

export default class Dialog extends Phaser.GameObjects.Container {
    
    constructor(scene, x, y, text){
        super(scene, x, y);

        scene.add.existing(this);

        this.text = scene.add.text(90, 120, text, {
            color: '#00009C',
            fontSize: '15px',
            wordWrap: {width: 150},
            align:'center'
        });

        this.text.setOrigin(0.5);

        this.balloon = scene.add.graphics();
        this.balloon.fillStyle(0x5F9F9F, 0.9);
        this.balloon.fillRoundedRect(-10, 90, 200, 70, 10);   

    
        setTimeout(() => {
            this.setVisible(false);
            this.destroy;
        }, 4000); 

        
        this.add(this.balloon);
        this.add(this.text);

    }
}