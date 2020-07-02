import React, { useState, useEffect, useCallback } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { withRouter, useParams, Link } from "react-router-dom";

//Redux
import { userLogin, userLogOut } from "../../Redux/user/userAction";

//component
import ItemHead from "../../components/ItemHead/itemHead";
// import MyBreadcrumb from "../../components/MyBreadCrumb/myBreadCrumb";
// import ItemCardData from "./itemCard.data";
import ItemCategoryFilter from "../../components/ItemCategoryFilter/itemCategoryFilter";
import ItemBrandFilter from "../../components/ItemBrandFilter/itemBrandFilter";

import MainContainer from "../../components/mainContainer";
import ItemCard from "../../components/ItemCard/itemCard";
import "./itemList.scss";
import WishList from "../../components/WishList/wishList";
const ItemList = (props) => {
    //Redux
    const { user, userLogin, userLogOut } = props;

    //localstate
    const [originalCardData, setOriginalCardData] = useState([]);
    const [itemCardData, setItemCardData] = useState([]);
    const [itemHeadData, setItemHeadData] = useState([]);
    const [itemWishList, setItemWishList] = useState([]);
    //拿到網址上的 ":brandName"參數
    const brandOrCategory = useParams().brandOrCategory;
    const name = useParams().Name;

    //filter toggle
    const [filterToggle, setFilterToggle] = useState(false);

    //僅做擷取商品資料用途
    const fetchCardData = async (brandOrCategory, name) => {
        // const brand = "chanel";
        // console.log(brand);
        const res = await fetch(
            `http://localhost:3030/itemlist/${brandOrCategory}/${name}`
        );
        const data = await res.json();
        // console.log("data", data);
        return data;
    };

    //取得願望清單
    const fetchWishList = async (brandOrCategory, name) => {
        const res = await fetch(
            `http://localhost:3030/itemlist/wishlist/${brandOrCategory}/${name}`,
            { credentials: "include" }
        );
        const dataWish = await res.json();
        console.log("dataWish", dataWish);
        return dataWish;
    };

    const handleOpenFilter = () => {
        setFilterToggle(true);
    };

    //一開始載入
    useEffect(() => {
        console.log("changed");

        (async () => {
            //1. 獲得資料data
            const rawData = await fetchCardData(brandOrCategory, name);
            const headData = rawData[0]; //標題資料
            const cardData = rawData[1]; //卡片資料
            setItemHeadData(headData);
            setOriginalCardData(cardData);
            setItemCardData(cardData);
        })();
        // console.log("born");
        setFilterToggle(false);
    }, [name]);

    //登入/登出/載入該頁時，取得願望清單
    useEffect(() => {
        if (user.logInStatus) {
            (async () => {
                // console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
                const wishListData = await fetchWishList(brandOrCategory, name);
                const logInStatus = wishListData.logInStatus;
                const userInfo = wishListData.userInfo;

                console.log("wishListData", wishListData);

                // //reset user
                logInStatus ? userLogin(userInfo) : userLogOut();

                if (logInStatus) {
                    setItemWishList(wishListData.wishList);
                }
            })();
        }
    }, [user.logInStatus, name]);

    return (
        <>
            {filterToggle ? (
                <div
                    className="cover"
                    onClick={() => {
                        setFilterToggle(false);
                    }}
                ></div>
            ) : (
                ""
            )}
            <ItemHead
                Banner={`http://localhost:3030/images/banner/${
                    itemHeadData.length
                        ? itemHeadData[0].brandBanner
                            ? itemHeadData[0].brandBanner
                            : itemHeadData[0].itemCategoryBanner
                            ? itemHeadData[0].itemCategoryBanner
                            : ""
                        : ""
                }.png`}
                Name={
                    itemHeadData.length
                        ? itemHeadData[0].brandName
                            ? itemHeadData[0].brandName
                            : itemHeadData[0].itemCategoryName
                            ? itemHeadData[0].itemCategoryName
                            : ""
                        : ""
                }
                Discription={
                    itemHeadData.length
                        ? itemHeadData[0].brandDiscription
                            ? itemHeadData[0].brandDiscription
                            : ""
                        : ""
                }
            />
            {console.log("itemWishList", itemWishList)}

            <MainContainer>
                <div className="filter-btn-container d-flex">
                    <div className="filter-btn-group">
                        <div className="filter-btn" onClick={handleOpenFilter}>
                            Refine your search
                        </div>
                    </div>
                    <div>
                        <div className="filter-btn">Order by</div>
                    </div>
                </div>
                {brandOrCategory === "brand" ? (
                    <ItemCategoryFilter
                        setItemCardData={setItemCardData}
                        originalCardData={originalCardData}
                        otherClass={!filterToggle ? "filter-bar-close" : ""}
                        filterToggle={filterToggle}
                        setFilterToggle={setFilterToggle}
                        brandOrCategory={brandOrCategory}
                        name={name}
                    />
                ) : (
                    <ItemBrandFilter
                        setItemCardData={setItemCardData}
                        originalCardData={originalCardData}
                        otherClass={!filterToggle ? "filter-bar-close" : ""}
                        filterToggle={filterToggle}
                        setFilterToggle={setFilterToggle}
                        brandOrCategory={brandOrCategory}
                        name={name}
                    />
                )}
                <div className="item-list-container d-flex flex-wrap ">
                    {itemCardData.length
                        ? itemCardData.map((el, index) => {
                              return (
                                  <ItemCard
                                      key={el.itemId}
                                      itemId={el.itemId}
                                      itemimg={`http://localhost:3030/images/items/${el.itemImg}.png`}
                                      itemName={el.itemName}
                                      itemPrice={`NT$ ${el.itemPrice}`}
                                      name={name}
                                      wish={
                                          itemWishList.findIndex((eachWish) => {
                                              return el.itemId === eachWish;
                                          }) < 0
                                              ? false
                                              : true
                                      }
                                      //   itemWishList={itemWishList}
                                      //   setitemWishList={setitemWishList}
                                  />
                              );
                          })
                        : ""}
                    {/* {itemCardData[0].items.map((el, index) => {
                    return (
                        <ItemCard
                            id={el.id}
                            src={el.src}
                            Name={el.name}
                            Price={el.price}
                            itemWishList={itemWishList}
                            setitemWishList={setitemWishList}
                        />
                    );
                })} */}
                </div>
            </MainContainer>
        </>
    );
};

//

const mapStateToProps = (store) => {
    return { user: store.user, userToggle: store.nav };
};

//Redux引入函式
//mapDispatchToProps
const mapDispatchToProps = (dispatch) => {
    return bindActionCreators({ userLogin, userLogOut }, dispatch);
};

export default withRouter(
    connect(mapStateToProps, mapDispatchToProps)(ItemList)
);
