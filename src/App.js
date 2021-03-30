import React, { useState, useEffect, useRef } from "react";
import loadingGif from "./maskLoading.gif";
import locationPNG from "./location.png";
import "./App.scss";

function sessionInputValue() {
  const sessionInput = sessionStorage.getItem("inputValue");
  return sessionInput ? sessionInput : "";
}
console.log("sessionInputValue", sessionInputValue());
function debounce(fn, delay, immediate) {
  let timer = null;
  return function() {
    clearTimeout(timer);
    let context = this;
    let args = arguments;
    if (!timer && immediate) {
      fn.apply(context, args);
    }
    timer = setTimeout(function() {
      if (!immediate) {
        fn.apply(context, args);
      } else {
        timer = null;
      }
    }, delay);
  };
}
const MapTest = ({ dataList }) => {
  console.log("dataList", dataList[0]["properties"]["updated"]);
  if (dataList.length === 0) return <div>沒有資料</div>;
  const hasMask = "#21aa93";
  const emptyMask = "#434343";
  return dataList.map((itm, idx) => {
    return (
      <a
        className="mapListItem"
        key={itm["properties"]["id"]}
        href={`https://www.google.com.tw/maps/place/${itm["geometry"]["coordinates"][1]},${itm["geometry"]["coordinates"][0]}`}
        target="_blank"
        rel="noreferrer noopener"
      >
        <div className="listWrap">
          <div className="stock">
            {itm["properties"]["mask_adult"] > 0 ||
            itm["properties"]["mask_child"] > 0 ? (
              <div className="hasStock">
                <div>有庫存</div>
              </div>
            ) : (
              <div className="emptyStock">
                <div>無庫存</div>
              </div>
            )}
          </div>
          <div className="items">
            <div className="name">
              {/* <span className="title">藥局姓名</span> */}
              <span>{itm["properties"]["name"]}</span>
              <img src={locationPNG} alt="location" />
            </div>
            <div className="mask_number">
              <span style={{ color: "#fff", background: "#113f67" }}>成人</span>
              <span
                style={
                  itm["properties"]["mask_adult"] > 0
                    ? { color: hasMask }
                    : { color: emptyMask }
                }
              >
                {itm["properties"]["mask_adult"]}
              </span>
              <span style={{ color: "#fff", background: "#dd6b4d" }}>小孩</span>
              <span
                style={
                  itm["properties"]["mask_child"] > 0
                    ? { color: hasMask }
                    : { color: emptyMask }
                }
              >
                {itm["properties"]["mask_child"]}
              </span>
            </div>
            <div className="phone">
              <span>{itm["properties"]["phone"]}</span>
            </div>
            <div className="address">
              <span>{itm["properties"]["address"]}</span>
            </div>
            <div className="updated">
              <span className="title">更新時間</span>
              <span>{itm["properties"]["updated"]}</span>
            </div>
          </div>
        </div>
      </a>
    );
  });
};

const eq = (prevProps, nextProps) => {
  console.log(
    "prevProps",
    prevProps.dataList[0]["properties"]["updated"].toString()
  );
  console.log(
    "nextProps",
    nextProps.dataList[0]["properties"]["updated"].toString()
  );
  console.log("boolean", prevProps.dataList === nextProps.dataList);

  return prevProps.dataList === nextProps.dataList;
};

const MapItem = React.memo(MapTest, eq);

const MapList = ({ mapData, sessionInput }) => {
  const [searchText, setSearchText] = useState("");
  const [dataList, setDataList] = useState(mapData);
  console.log("mapData", mapData[0]["properties"]["updated"]);
  const dataFilter = searchText => {
    let mapArr = mapData.filter(
      (itm, idx) => itm["properties"]["address"].indexOf(searchText) !== -1
    );
    setDataList(mapArr);
  };

  const debounceSearch = useRef(debounce(dataFilter, 500));

  //didMount看有沒session
  useEffect(() => {
    if (sessionInput === "") return;
    setSearchText(sessionInput);
  }, []);

  //didUpdate 搜尋、更新
  useEffect(() => {
    console.log("change");
    debounceSearch.current(searchText);
    sessionStorage.setItem("inputValue", searchText);
  }, [searchText, mapData]);

  return (
    <React.Fragment>
      <div className="header">
        <h1 onClick={() => window.location.reload()}>口罩即時庫存列表</h1>
        <div className="listWrap">
          <div className="inputWrap">
            <span>請輸入地址：</span>
            <input
              type="text"
              name="address"
              onChange={e => {
                setSearchText(e.target.value);
              }}
              value={searchText}
              placeholder="台北市、大安區、基隆路"
            />
          </div>
        </div>
      </div>
      <div className="mapList">
        <MapItem dataList={dataList}></MapItem>
      </div>
      <div className="reload" onClick={() => window.location.reload()}/>
    </React.Fragment>
  );
};

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [mapData, setMapData] = useState([]);
  const [errText, setErrText] = useState("");
  const [sessionInput, setSessionInput] = useState("");
  const [time, setTime] = useState(0);
  //didMount
  useEffect(() => {
    fetch(
      "https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json"
    )
      .then(response => {
        return response.json();
      })
      .then(data => {
        let mapArr = Object.values(data)[1];
        setMapData(mapArr);
        setSessionInput(sessionInputValue);
        setIsLoading(false);
        console.log(`create by Jeremy Chang 02272348`);
      })
      .catch(err => setErrText("好像壞了"));
  }, []);
  //didUpdate
  useEffect(() => {
    if (time < 60) {
      setTimeout(() => {
        setTime(time + 1);
      }, 1000);
      console.log("time", time);
    }
    if (time === 60) {
      setTime(0);
      fetch(
        "https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json"
      )
        .then(response => {
          return response.json();
        })
        .then(data => {
          let mapArr = Object.values(data)[1];
          console.log("mapArr", mapArr[0]);
          setMapData(mapArr);
          setSessionInput(sessionInputValue);
          setIsLoading(false);
          console.log("didupdate");
        })
        .catch(err => {
          setIsLoading(true);
          setErrText("好像壞了");
        });
    }
  }, [time]);
  if (isLoading)
    return (
      <div className="App">
        <div className="loading">
          <img src={loadingGif} alt="" />
        </div>
      </div>
    );
  if (errText || !mapData || mapData.length === 0) {
    return (
      <div className="App">
        <div>{errText}</div>
      </div>
    );
  }
  return (
    <div className="App">
      <MapList mapData={mapData} sessionInput={sessionInput} />
      <div className="designer">by Jeremy Chang</div>
      <div className="information">
        資料提供：
        <a href="https://g0v.hackmd.io/gGrOI4_aTsmpoMfLP1OU4A">
          口罩供需資訊平台
        </a>
        、
        <a href="https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json">
          藥局+衛生所即時庫存 geojson by kiang
        </a>
      </div>
    </div>
  );
}

export default App;
