import React, { useState, useEffect } from "react";

const BASE_URL = process.env.PUBLIC_URL + "/card-images/";

interface ICard {
  isFlippable?: boolean;
  card: string;
}

const Card = ({ isFlippable, card }: ICard) => {
  const [isOpen, setOpen] = useState<boolean>(true);
  const src = isOpen ? BASE_URL + card + ".jpg" : BASE_URL + "red_back.jpg";

  const handleClick = () => {
    if (isFlippable) {
      setOpen(!isOpen);
    }
  };

  return <img key={card} src={src} onClick={handleClick} />;
};

export default Card;
