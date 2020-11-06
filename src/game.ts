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
    host: '192.168.0.125',
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
  function startJoc(conn_: Peer.DataConnection) {
    conn = conn_;
    const boats: number[] = [5, 4, 3, 2, 2];
    const max = boats.reduce((first, last) => first + last);
    app.stage.removeChild(ConnectCointainer);
    const gameContainer = new PIXI.Container();
    app.stage.addChild(gameContainer);
    const redRectangleTexture = PIXI.Texture.from('assets/blow.png');
    const whiteRectangleTexture = PIXI.Texture.from('assets/unknown.png');
    const blueRectangleTexture = PIXI.Texture.from('assets/water.png');
    const grayRectangleTexture = PIXI.Texture.from('assets/naval.png');
    const fighterContainer = new PIXI.Container();
    const fighterTable: PIXI.Sprite[][] = [];
    fighterContainer.x = 100;
    fighterContainer.y = 100;
    fighterContainer.addChild(...[...Array(100).keys()].map((iterator) => {
      const rectangle = new PIXI.Sprite(whiteRectangleTexture);
      const x = iterator % 10;
      const y = Math.floor(iterator / 10);
      if (x === 0) {
        fighterTable.push([]);
      }
      const [lastItem] = fighterTable.slice(-1);
      lastItem.push(rectangle);
      rectangle.x = x * 21;
      rectangle.y = y * 21;
      rectangle.interactive = true;
      return rectangle;
    }));
    const yourTable: PIXI.Sprite[][] = [];
    const yourContainer = new PIXI.Sprite();
    yourContainer.x = 320;
    yourContainer.y = 100;
    yourContainer.addChild(...[...Array(100).keys()].map((iterator) => {
      const rectangle = new PIXI.Sprite(blueRectangleTexture);
      const x = iterator % 10;
      if (x === 0) {
        yourTable.push([]);
      }
      const y = Math.floor(iterator / 10);
      rectangle.x = x * 21;
      rectangle.y = y * 21;
      rectangle.interactive = true;
      const [lastItem] = yourTable.slice(-1);
      lastItem.push(rectangle);
      return rectangle;
    }));
    gameContainer.addChild(fighterContainer);
    gameContainer.addChild(yourContainer);
    class Cell {
      sprite: PIXI.Sprite;

      isUnknown = false;

      isNaval = false;

      isWater = false;

      isDestroyed = false;

      constructor(variable: 'water'|'unknown', sprite: PIXI.Sprite) {
        this.sprite = sprite;
        if (variable === 'water') {
          this.toWater();
        }
        if (variable === 'unknown') {
          this.toUnknown();
        }
      }

      toWater = (): void => {
        this.isWater = true;
        this.isNaval = false;
        this.isUnknown = false;
        this.isDestroyed = false;
        this.sprite.texture = blueRectangleTexture;
      };

      toNaval = (): void => {
        this.isWater = false;
        this.isNaval = true;
        this.isUnknown = false;
        this.isDestroyed = false;
        this.sprite.texture = grayRectangleTexture;
      };

      toUnknown = (): void => {
        this.isWater = false;
        this.isNaval = false;
        this.isUnknown = true;
        this.isDestroyed = false;
        this.sprite.texture = whiteRectangleTexture;
      };

      toDestroyed = (): void => {
        this.isWater = false;
        this.isNaval = false;
        this.isUnknown = false;
        this.isDestroyed = true;
        this.sprite.texture = redRectangleTexture;
      }

      destroy = (): boolean => {
        if (this.isNaval) {
          return true;
        }
        return false;
      };
    }
    const fighterDetails: Cell[][] = [];
    const yourDetails: Cell[][] = [];
    for (let row = 0; row < 10; row += 1) {
      fighterDetails.push([]);
      const rowVector = fighterDetails[row];
      for (let collumn = 0; collumn < 10; collumn += 1) {
        rowVector.push(new Cell('unknown', fighterTable[row][collumn]));
      }
    }
    for (let row = 0; row < 10; row += 1) {
      yourDetails.push([]);
      const rowVector = yourDetails[row];
      for (let collumn = 0; collumn < 10; collumn += 1) {
        rowVector.push(new Cell('water', yourTable[row][collumn]));
      }
    }
    let whoMoves: 'me' | 'another' | 'unknown' = 'unknown';
    function flip() {
      if (whoMoves === 'me') {
        whoMoves = 'another';
      }
      if (whoMoves === 'another') {
        whoMoves = 'me';
      }
    }
    let latestCoordinates: {x: number; y: number};
    const sendTryToDestroy = (coordinates: {x: number; y: number}): void => {
      if (whoMoves === 'unknown') {
        whoMoves = 'me';
      }
      if (whoMoves === 'me' && fighterDetails[coordinates.y][coordinates.x].isUnknown) {
        latestCoordinates = coordinates;
        conn.send({
          coordinates,
          type: 'destroy',
        });
        whoMoves = 'another';
      }
    };
    for (let row = 0; row < 10; row += 1) {
      for (let collumn = 0; collumn < 10; collumn += 1) {
        fighterDetails[row][collumn].sprite.on('click', () => {
          sendTryToDestroy({ x: collumn, y: row });
        });
      }
    }
    for (let row = 0; row < 10; row += 1) {
      for (let collumn = 0; collumn < 10; collumn += 1) {
        yourTable[row][collumn].on('click', () => {
          const boatSize = (boats.length ? boats[0] : 0);
          const direction = (prompt('H - horizontal / V - vertical', 'H') as 'H'|'V').toUpperCase();
          if (direction === 'V') {
            for (let iterator = 0; iterator < boatSize; iterator += 1) {
              yourDetails[row + iterator][collumn].toNaval();
            }
          }
          if (direction === 'H') {
            for (let iterator = 0; iterator < boatSize; iterator += 1) {
              yourDetails[row][collumn + iterator].toNaval();
            }
          }
          if (direction === 'H' || direction === 'V') {
            boats.shift();
          }
        });
      }
    }

    conn.on('data', (data: {type: 'destroy'; coordinates: {x: number; y: number}} | {type: 'response'; isHurted: boolean}) => {
      console.log(data);
      if (data.type === 'destroy' && (whoMoves === 'unknown' || whoMoves === 'another')) {
        if (whoMoves === 'unknown') {
          whoMoves = 'another';
        }
        if (yourDetails[data.coordinates.y][data.coordinates.x].isNaval) {
          yourDetails[data.coordinates.y][data.coordinates.x].toDestroyed();
          conn.send({ type: 'response', isHurted: true });
        } else {
          conn.send({ type: 'response', isHurted: false });
        }
        whoMoves = 'me';
      }
      if (data.type === 'response') {
        if (data.isHurted) fighterDetails[latestCoordinates.y][latestCoordinates.x].toDestroyed();
        if (!data.isHurted) fighterDetails[latestCoordinates.y][latestCoordinates.x].toWater();
      }
    });
  }
  ButtonSprite.on('click', () => {
    console.log(inputCode.text);
    conn = peer.connect(inputCode.text);
    startJoc(conn);
  });
  peer.on('connection', (conn_) => {
    console.log(conn_.peer);
    startJoc(conn_);
  });
  ConnectCointainer.addChild(ButtonSprite);
};
