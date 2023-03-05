import { getData, setData } from "./dataStore";

function clearV1() {
  const data = getData();
  data.channels.length = 0;
  data.users.length = 0;
  setData(data);
  return {};
}

export { clearV1 };
