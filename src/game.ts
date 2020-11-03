import * as PIXI from 'pixi.js';
import TextInput from 'pixi-text-input';
import Peer from 'peerjs';
import sjcl from 'sjcl';

export default (canvas: HTMLCanvasElement) => {
  const app = new PIXI.Application({
    width: 800,
    height: 600,
    backgroundColor: 0x1099bb,
    view: canvas,
  });
  const ConnectCointainer = new PIXI.Container();
  function makeString(number: number): string {
    let outString = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    outString = [...Array(number)].map(() => characters
      .charAt(Math.floor(Math.random() * charactersLength))).join('');
    return outString;
  }
  const ID: string = makeString(5);
  const peer = new Peer(ID, {
    host: 'localhost',
    key: 'game',
    port: 2020,
  });
  peer.on('open', (id: string) => {
    console.log(`My peer ID is: ${id}`);
  });
  const inputCode = new TextInput({
    input: {
      fontSize: '36px',
      padding: '12px',
      width: '500px',
      color: '#26272E',
      'text-align': 'center',
    },
    box: {
      default: { fill: 0xE8E9F3, rounded: 12, stroke: { color: 0xCBCEE0, width: 3 } },
      focused: { fill: 0xE1E3EE, rounded: 12, stroke: { color: 0xABAFC6, width: 3 } },
      disabled: { fill: 0xDBDBDB, rounded: 12 },
    },
  });
  console.log(app.screen.width);
  console.log(app.screen.height);
  inputCode.placeholder = 'enter invite code';
  inputCode.x = app.screen.width / 2;
  inputCode.y = app.screen.height / 2;
  inputCode.pivot.x = inputCode.width / 2;
  inputCode.pivot.y = inputCode.height / 2;
  ConnectCointainer.addChild(inputCode);
  //
  const style = new PIXI.TextStyle({
    dropShadow: true,
    dropShadowBlur: 1,
    fill: 'white',
    fontFamily: 'Comic Sans MS',
    fontSize: 30,
  });
  const text = new PIXI.Text(`Your code: ${ID}`, style);
  text.x = app.screen.width / 2;
  text.y = app.screen.height / 2 - 70;
  text.pivot.x = text.width / 2;
  text.pivot.y = text.height / 2;
  ConnectCointainer.addChild(text);
  app.stage.addChild(ConnectCointainer);
  // var conn = peer.connect('1234');
  let conn: Peer.DataConnection;
  const ButtonTexture = PIXI.Texture.from('assets/connect.png');
  const ButtonSprite = new PIXI.Sprite(ButtonTexture);
  ButtonSprite.anchor.set(0.5);
  ButtonSprite.x = app.screen.width / 2;
  ButtonSprite.y = app.screen.height / 2 + 80;
  ButtonSprite.buttonMode = true;
  ButtonSprite.interactive = true;
  function startJoc(conn: Peer.DataConnection) {
    app.stage.removeChild(ConnectCointainer);
    const gameContainer = new PIXI.Container();
    app.stage.addChild(gameContainer);
  }
  ButtonSprite.on('click', () => {
    console.log(inputCode.text);
    conn = peer.connect(inputCode.text);
    startJoc(conn);
  });
  peer.on('connection', (conn_) => {
    conn = conn_;
    console.log(conn.peer);
    startJoc(conn);
  });
  ConnectCointainer.addChild(ButtonSprite);
};
