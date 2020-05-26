import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import style from "./styles.module.scss";
import Card from "../../components/Card";

const ENDPOINT = "https://dealer-backend.herokuapp.com/";

const Loading = () => <h1>joining room</h1>;

const Room = () => {
  const [socket, setSocket] = useState<any>(null);

  const [game, updateGame] = useState<any>({
    inGame: false,
    centerCards: [],
  });
  const gameRef = useRef(game);

  useEffect(() => {
    gameRef.current = game;
  });

  useEffect(() => {
    setSocket(io(ENDPOINT));
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on("joined", updateGameState);
    socket.on("playerJoined", updateGameState);
    socket.on("playerLeft", updateGameState);

    socket.on("deal", updateGameState);

    socket.on("clearTable", () => {
      updateGame({
        host: gameRef.current.host,
        numPlayers: gameRef.current.numPlayers,
        centerCards: [],
        cards: [],
        inGame: false,
      });
    });

    socket.on("center-pile", updateGameState);

    return () => {
      socket.off("joined", updateGameState);
      socket.off("playerJoined", updateGameState);
      socket.off("playerLeft", updateGameState);
    };
  }, [socket]);

  const startHand = () => {
    socket.emit("deal");
  };

  const nextCard = () => {
    socket.emit("cardsWanted");
  };

  const updateGameState = (newData: any) => {
    if (newData.centerCards) {
      newData.centerCards.unshift(...gameRef.current.centerCards);
    }

    console.log({
      ...gameRef.current,
      ...newData,
    });

    updateGame({
      ...gameRef.current,
      ...newData,
    });
  };

  if (!socket) return <Loading />;

  if (!game) return <Loading />;

  if (!game.inGame)
    return (
      <div className={style.container}>
        <h5>{game.numPlayers} people playing</h5>
        {game.host && <button onClick={startHand}>start game</button>}
      </div>
    );

  return (
    <div className={style.container}>
      <h5>{game.numPlayers} people playing</h5>
      <h5>board</h5>
      <div className={style.board}>
        {game.centerCards.map((card: string) => (
          <Card card={card} />
        ))}
      </div>
      <h5>your hand</h5>
      <div className={style.hand}>
        {game.cards.map((card: string) => (
          <Card card={card} isFlippable />
        ))}
      </div>
      {game.host && <button onClick={nextCard}>Next</button>}
    </div>
  );

  return (
    <div className={style.container}>
      <h5>{game.numPlayers} people playing</h5>
      {game.host && !game.inGame && (
        <button onClick={startHand}>start game</button>
      )}
      <h5>board</h5>
      {game.inGame && (
        <div className={style.board}>
          {game.centerCards.map((card: string) => (
            <img
              key={card}
              src={process.env.PUBLIC_URL + "/card-images/" + card + ".png"}
            />
          ))}
        </div>
      )}
      <h5>your hand</h5>
      {game.inGame && (
        <div className={style.hand}>
          {game.cards.map((card: string) => (
            <img
              key={card}
              src={process.env.PUBLIC_URL + "/card-images/" + card + ".png"}
            />
          ))}
        </div>
      )}

      {game.inGame && game.host && <button onClick={nextCard}>Next</button>}
    </div>
  );
};

export default Room;
