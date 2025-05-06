import { useState } from "react";

const Pagination = ({ itemsPerPage }) => {
  console.log("items", itemsPerPage);
  const [itemOffset, setItemOffset] = useState(0);
  const endOffset = itemOffset + itemsPerPage;

  return <></>;
};

export default Pagination;
