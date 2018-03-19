/**
 * Created by jamie on 2016/1/25.
 */

var picData=[
    {picName:"深圳紫城别苑效果图1",picSrc:"img/san-francisco.jpg",picDetail:"图片说明文字图片说明文字图片说明文字图片说明文字图片说明文字一"},
    {picName:"深圳紫城别苑效果图2",picSrc:"img/rio.jpg",picDetail:"图片说明文字图片说明文字图片说明文字图片说明片说明文字二"},
    {picName:"深圳紫城别苑效果图3",picSrc:"img/london.jpg",picDetail:"图片说明文字图片说明文字图片说明文字图片说明文字图片说明文字三"},
    {picName:"深圳紫城别苑效果图4",picSrc:"img/new-delhi.jpg",picDetail:"图片说明文字图片说明文字4"},
    {picName:"深圳紫城别苑效果图5",picSrc:"img/toronto.jpg",picDetail:"图片说明文字图片说明文字图片说明文字5"},
    {picName:"深圳紫城别苑效果图6",picSrc:"img/new-delhi.jpg",picDetail:"图片说明文字图片说明文字6"}
];


function createAlbumSliderShow(data,idName){
    //console.log(data);

    var $imgUl=$('<div id="'+ idName +'" class="J_albumSlider"><ul></ul></div>');
    for(var i= 0,picHtml='';i<data.length;i++){
        picHtml+='<li>'+
                    '<img src="'+ data[i].picSrc +'" alt="' + data[i].picName + '" data-title="' + data[i].picName + '" data-description="' + data[i].picDetail + '">'+
                    '<div class="pictureText clearfloat">'+
                    '<h3>' + data[i].picName + '</h3>'+
                    '<p>' + data[i].picDetail + '</p></div></li>'
    }
    $imgUl.find("ul").append(picHtml);
    $imgUl.appendTo("body");
}

createAlbumSliderShow(picData,"myPicGroup");