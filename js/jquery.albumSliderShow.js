/**
 * Created by jamie on 2016/1/19.
 */


;(function($,window,document){

    var defaults={
        'startIndex':0,    //从第几张图开始播放
        'hasThumbnail': true,  //是否显示缩略图
        'animateType': 'fadeInRightBig',  //动画效果
        'fullScreen': false,  //是否满屏显示，默认false，即按原图尺寸显示
        'hasSmallView':true,  //是否出现右下角的预览图
        'isAutoPlay':false   //是否自动播放
    };

    //定义AlbumSlider的构造函数
    function AlbumSlider(ele, opt) {
        var self=this;

        this.element = ele;
        $(this.element).data("albumSlider", this);
        this.options = $.extend({},defaults, opt);
        this.bodyNode=$(document.body);
        this.imgListData=null;
        this.sImgWidth=105;
        this.total=0;
        this.curIndex=0;  //当前被选中的图片索引值
        this.moveLeftCount=0;  //缩略图往左移动的步数
        this.winWidth=$(window).width();
        this.myTimer=null; //自动播放

        if(!AlbumSlider.isInit)
        {
            AlbumSlider.isInit = true;
            self.init();
        }

    }

    AlbumSlider.isInit = false;

    //定义AlbumSlider的方法
    AlbumSlider.prototype = {
        init:function(){
            var self=this;
            self.getJson();
            self.getInfo();
        },

        getJson:function(){
            var self=this,
                ele=self.element,
                imgData=self.options.data;

            if(imgData){
                self.createImgList(imgData);
            }else{
                return ;
            }

        },

        createImgList:function(d){
            var self=this,
                data= d,
                ele=this.element;
            var showListStyle=true;
            //console.log(typeof(d));
            //console.log(d);

            if(typeof(d)==='object'){
                for(var i=0;i<data.length;i++){

                    var imgData=createData(data[i].data);

                    var imgHtml='<h2 class="J_albumSlider_groupTitle">'+ data[i].title +'</h2>'+
                        '<ul class="picture-slide-list clearfloat">'+ createImgLi(imgData) +'</ul>';

                    if(showListStyle){
                        $('<div id="'+data[i].group+'" class="J_albumSlider">'+ imgHtml +'</div>').appendTo($(ele)).albumSliderShow();

                    }
                    else{
                        $('<div id="'+data[i].group+'" class="J_albumSlider">'+ imgHtml +'</div>').appendTo($(ele)).albumSliderShow({

                        });
                        $("#"+data[i].group).find("[data-role=album]").get(2).click()
                    }
                }
            }


            function createData(data){
                for(var j= 0,imgData=[];j<data.length;j++){
                    imgData.push({
                        'title':data[j].alt,
                        'src':data[j].src
                    });
                }
                return imgData;
            }

            function createImgLi(data){
                var imgLi='';
                for(var n= 0;n<data.length;n++){
                    imgLi+='<li data-role="album" src="'+ data[n].src +'" data-title="'+ data[n].title +'"><img src="'+ data[n].src +'">' +
                        '<div class="pictureText"><h3>' +data[n].title +'</h3></div>'+
                    '</li>'
                }
                return imgLi;
            }

        },


        getInfo:function(){
            var self=this,
                starIndex =self.options.startIndex,
                listData=[],  //放置同一组图片的信息
                curIndex= 0,
                total=0;

            //点击图片时获取图片信息
            self.bodyNode.on("click",".J_albumSlider ul li",function(e,cIndex){
                e.stopPropagation();

                var $this=$(this),
                    self = $this.closest(".J_albumSlider").data("albumSlider"),
                    $self=$(self.element),
                    imgList=$self.find("[data-role=album]");

                if(!self)
                {
                    return;
                }

                if(starIndex){
                    curIndex=starIndex;
                }else{
                    curIndex=$this.index(); //被点击图片的索引值
                }

                total=imgList.size();

                //console.log(curIndex)
                //console.log($self.attr("id"))


                listData=[];
                imgList.each(function(){
                    var imgTitle=$(this).attr("title")||$(this).data("title")||"未命名图片";

                    listData.push({
                        src:$(this).attr("src")||$(this).data("src"),
                        title:imgTitle
                    })
                });


                self.total=total; //所有图片的个数
                self.curIndex=(curIndex==-1)?0:curIndex; //被点击图片的索引值
                self.imgListData=listData;  //所有图片的信息


                self.render();
                self.setStyle();
                self.showPopup();
                self.slider();
            });

        },

        //创建弹出相册的html
        createHtml:function(){
            var self=this,
                data=self.imgListData,
                cIndex=self.curIndex,
                hasThumbnail=self.options.hasThumbnail,
                animateType=self.options.animateType,
                hasSmallView=self.options.hasSmallView,
                smImgListHtml='',  //缩略图列表
                popupHtml=[];

            if(data && data.length>0){
                var total=data.length,
                    curTitle=data[cIndex].title||"未命名图片";

                for(var i=0;i<data.length;i++){
                    smImgListHtml+='<li><img src="'+ data[i].src +'"/></li>'
                }
            }


            //生成图片展示的标题html
            popupHtml[1]='<div class="picture-dialog-header">'+'<div class="picture-dialog-num">(<span>'+ (cIndex+1) +'</span>/<span>'+ total +'</span>)</div>'+
            '<h3>'+ curTitle +'</h3>'+'<span class="picture-dialog-btn auto-play-btn picture-start-btn" isStart="false"></span><span class="picture-dialog-btn picture-dialog-close-btn"></span></div>';
            //生成图片展示区的html
            popupHtml[2]='<div class="picture-dialog-detail">'+
            '<img class="curImg animated '+ animateType +'" src="'+ data[cIndex].src +'" alt=""/>'+
            '<span class="picture-dialog-btn prev-btn"></span>'+
            '<span class="picture-dialog-btn next-btn"></span>'+
            '</div>';
            //是否含有缩略图列表
            if(hasThumbnail){
                popupHtml[3]='<div class="picture-dialog-list">'+'<div class="picture-dialog-move-box"><ul>'+ smImgListHtml +'</ul></div>'+
                '<span class="picture-dialog-list-icon btn-disabled prev-btn"><span class="prev-icon"></span></span>'+
                '<span class="picture-dialog-list-icon next-btn"><span class="next-icon"></span></span></div>'
            }else{
                popupHtml[3]='';
            }

            //如果图片只有一张
            if(self.total==1){
                popupHtml[2]='<div class="picture-dialog-detail">'+
                '<img class="curImg animated '+ animateType +'" src="'+ data[cIndex].src +'" alt=""/>'+
                '</div>';
                popupHtml[3]='';
            }

            //是否有右下角预览小图
            if(hasSmallView){
                popupHtml[4]='<div id="J_albumSlider_sm_img">'+
                '<img src="'+ data[cIndex].src +'">'+
                '<div class="move_mask"></div>'+
                '<div class="top_move_mask"></div>'+
                '</div>';
            }else{
                popupHtml[4]='';
            }

            return popupHtml;
        },

        //渲染弹出相册
        render:function(){
            var self=this,
                popup=$("<div class='picture-dialog-container'>"),
                popListHtml=self.createHtml();

            popup.append(popListHtml[1]+popListHtml[2]+popListHtml[3]+popListHtml[4]);
            self.bodyNode.append(popup);

            self.popup=$(".picture-dialog-container");
            self.popImg=self.popup.find(".curImg");
            self.moveBox=$(".picture-dialog-move-box");

        },

        //设置样式
        setStyle:function(){
            var self=this,
                hasThumbnail=self.options.hasThumbnail,
                total=self.total,
                $moveBox=$(".picture-dialog-move-box"),
                $sBtn=$(".picture-dialog-list-icon"),
                isAutoPlay=self.options.isAutoPlay,
                $autoPlayBtn=$(".auto-play-btn"),  //自动播放按钮
                $picViewArea=$(".picture-dialog-detail");

            self.bodyNode.css({"overflow":"hidden"});
            $moveBox.children("ul").children("li").eq(self.curIndex).addClass("active");

            //是否显示自动播放按钮
            if(isAutoPlay){
                $autoPlayBtn.show()
            }else{
                $autoPlayBtn.hide()
            }

            //如果底部缩略图宽度超过屏幕宽度则显示按钮
            var screenWidth=$(window).width(),
                screenHeight=$(window).height(),
                mLength=total*105+10;
            if(mLength>screenWidth) {
                $sBtn.show();
            }

            //设置图片展示区域的高度
            if(hasThumbnail){
                $picViewArea.css({"height":(screenHeight-100)+'px'})
            }else{
                $picViewArea.css({"height":"100%"})
            }

            if(total==1){
                $picViewArea.css({"height":"100%"})
            }

            self.screenWidth=screenWidth;
            self.maxImgNum=Math.floor((screenWidth-10)/105);  //屏幕最多能显示的缩略图个数
            self.maxMoveCount=self.total-self.maxImgNum+1;  //最多能移动的数量

        },

        //设置图片加载时的图片尺寸、位置及动画效果
        loadPic:function(){
            var self=this,
                img=self.popImg,
                fullScreen=self.options.fullScreen;


            img.load(function(){
                img.css({
                    "width":"auto",
                    "height":"auto"
                });

                var imgWidth=img.width(),
                    imgHeight=img.height(),
                    winWidth=self.winWidth,
                    winHeight=$(".picture-dialog-detail").height();

                var isfull=false;
                if(imgWidth>winWidth || imgHeight>winHeight){
                    isfull=true
                }else if(fullScreen){
                    isfull=true
                }else{
                    isfull=false
                }

                //如果参数为真则满屏显示 否则按原图尺寸显示并居中
                var scale=isfull?Math.min(winWidth/imgWidth,winHeight/imgHeight): 1,
                    top=isfull?(winHeight-imgHeight*scale)/ 2:(winHeight-imgHeight)/ 2,
                    left=isfull?(winWidth-imgWidth*scale)/2:(winWidth-imgWidth)/2;
                img.css({
                    "width":imgWidth*scale,
                    "height":imgHeight*scale,
                    "top":top+'px',
                    "left":left+'px'
                }).hide().show(10);

                self.imgWidth=imgWidth*scale;
                self.imgHeight=imgHeight*scale;
                self.imgTop=top;
                self.imgLeft=left;
                self.winHeight=winHeight;

                self.scaleImg();

            })

        },

        showPopup:function(){
            var self=this,
                isAutoPlayControls=self.options.isAutoPlayControls,
                img=self.popup.find("img");
            self.popup.show();

            self.loadPic();
            self.checkActiveImg();

            if(isAutoPlayControls){
                self.autoHideControls()
            }
        },

        hide:function(){
            var self=this;

            self.popup.remove();
            self.bodyNode.css({"overflow":"auto"});
            self.moveLeftCount=0;
        },

        checkBtnIsAble:function(){
            var self=this;

            if(self.moveLeftCount>=self.maxMoveCount){
                $(".picture-dialog-list-icon.next-btn").addClass("btn-disabled");
                $(".picture-dialog-list-icon.prev-btn").removeClass("btn-disabled");
            }else if(self.moveLeftCount<=0){
                $(".picture-dialog-list-icon.prev-btn").addClass("btn-disabled");
                $(".picture-dialog-list-icon.next-btn").removeClass("btn-disabled");
            }

        },

        //初始化判断当前图片对应的缩略图是否在屏幕内显示
        checkActiveImg:function(){
            var self=this,
                maxMoveCount=self.maxMoveCount,
                activeIndex=self.curIndex;

            var midNum=Math.floor(maxMoveCount/2)+self.moveLeftCount;
            var step=activeIndex-midNum;
            var moveStep=0;


            //如果选中的图片的位置在屏幕右侧
            if(activeIndex-self.moveLeftCount>=self.maxImgNum){

                $(".picture-dialog-list-icon.prev-btn").removeClass("btn-disabled");

                moveStep=activeIndex+step>maxMoveCount?maxMoveCount:activeIndex+step;

                self.moveImgList(moveStep);
                self.moveLeftCount+=moveStep;

                self.checkBtnIsAble();
            }

            //如果选中的图片在屏幕左侧
            if(activeIndex<self.moveLeftCount){
                //console.log("左边")
                $(".picture-dialog-list-icon.next-btn").removeClass("btn-disabled");

                moveStep=activeIndex+step<0?0:activeIndex+step;

                self.moveImgList(moveStep);
                self.moveLeftCount=moveStep;

                self.checkBtnIsAble()
            }

        },

        //防止点击时图片文字被选中
        disabledClickChoose:function(){

            if(document.all){
                document.onselectstart= function(){return false;}; //for ie
            }else{
                document.onmousedown= function(){return false;};
                document.onmouseup= function(){return true;};
            }
            document.onselectstart = new Function('event.returnValue=false;');
        },

        //移动缩略图
        moveImgList:function(step){
            var self=this,
                SM_IMG_W=self.sImgWidth;
            $(".picture-dialog-move-box").animate({
                "left":-1*SM_IMG_W*step+'px'
            },300);
        },


        //相册的切换图片系列事件
        slider:function(){
            var self=this,
                totalNum=self.total,
                maxImgNum=self.maxImgNum,
                listData=self.imgListData,
                isAutoPlay=self.options.isAutoPlay,
                $curImg=$(".picture-dialog-detail img"),  //当前显示的大图
                $moveBox=$(".picture-dialog-move-box"),
                $sImg=$moveBox.children("ul").children("li"),  //缩略图
                $indexNum=$(".picture-dialog-num span:first-child"),  //索引数字
                $indexTitle=$(".picture-dialog-header h3"),  //索引标题
                $closeBtn=$(".picture-dialog-close-btn"),  //关闭按钮
                $autoPlayBtn=$(".auto-play-btn"),  //自动播放按钮
                $sPreBtn=$(".picture-dialog-list-icon.prev-btn"),  //小图左按钮
                $sNextBtn=$(".picture-dialog-list-icon.next-btn"), //小图右按钮
                $preBtn=$(".picture-dialog-btn.prev-btn"),
                $nextBtn=$(".picture-dialog-btn.next-btn"),
                $smallView=$("#J_albumSlider_sm_img");


            //切换样式
            function changeStyle(){

                $smallView.hide();
                var cIndex=self.curIndex;
                $curImg.unbind("mousedown").attr("src",listData[cIndex].src);
                $smallView.find("img").attr("src",listData[cIndex].src);
                $indexTitle.html(listData[cIndex].title);
                $indexNum.html(cIndex+1);

                $sImg.removeClass("active");
                $sImg.eq(cIndex).addClass("active");

                self.loadPic();
            }

            //如果选择自动播放
            function pausePlay(){
                $autoPlayBtn.attr("isStart","false").removeClass("picture-pause-btn").addClass("picture-start-btn");
                clearInterval(self.myTimer)
            }

            $autoPlayBtn.on('click',function(){
                var $this=$(this);
                var isStart=$this.attr("isStart");  //初始状态为false，即暂停状态

                if(isStart=='false'){
                    $autoPlayBtn.attr("isStart","true").removeClass("picture-start-btn").addClass("picture-pause-btn");
                    self.myTimer=setInterval(function(){
                        self.curIndex+=1;
                        if(self.curIndex==totalNum){
                            self.curIndex=0;
                            self.moveLeftCount=0;
                            self.moveImgList(self.moveLeftCount);
                            self.checkBtnIsAble();
                        }
                        self.checkActiveImg();
                        changeStyle();
                    },isAutoPlay);
                }else{
                    pausePlay();
                }

            });

            if(isAutoPlay){
                $autoPlayBtn.click();
            }


            //检查缩略图的按钮是否可用，并移动相应的步数
            function checkBtnIsAble(step,direction){
                var maxMoveCount=self.maxMoveCount;

                //点击左边按钮时
                if(direction=="left"){
                    if(self.moveLeftCount-step<=0){
                        self.moveLeftCount=0;
                        self.moveImgList(0);
                        $sPreBtn.addClass("btn-disabled");
                    }else{
                        self.moveLeftCount-=step;
                        self.moveImgList(self.moveLeftCount);
                    }
                }

                if(direction=="right"){
                    if(self.moveLeftCount+step>=maxMoveCount){
                        self.moveLeftCount=maxMoveCount;
                        self.moveImgList(maxMoveCount);
                        $sNextBtn.addClass("btn-disabled");
                    }else{
                        self.moveLeftCount+=step;
                        self.moveImgList(self.moveLeftCount);
                    }
                }
            }

            //点击缩略图列表左右按钮时
            var step=4;
            $sPreBtn.on("click",function(){
                var $this=$(this);
                if($this.attr("class").indexOf("disabled")!=-1){
                    return false;
                }
                $sNextBtn.removeClass("btn-disabled");

                checkBtnIsAble(step,"left");
            });
            $sNextBtn.on("click",function(){
                var $this=$(this);
                if($this.attr("class").indexOf("btn-disabled")!=-1){
                    return false;
                }
                $sPreBtn.removeClass("btn-disabled");

                checkBtnIsAble(step,"right");
            });

            //点击缩略图片时
            $sImg.on("click",function(){
                var $this=$(this);
                pausePlay();
                self.curIndex=$this.index();

                //更改当前显示的图片地址及名称、索引数字
                changeStyle();
            });


            //点击图片展示区左右按钮的事件
            $preBtn.on("click",function(){
                pausePlay();
                self.curIndex-=1;
                if(self.curIndex==-1){
                    self.curIndex=totalNum-1;
                    if(totalNum>maxImgNum){
                        self.moveLeftCount=self.maxMoveCount;
                        self.moveImgList(self.maxMoveCount);
                    }
                    self.checkBtnIsAble();
                }
                self.checkActiveImg();
                changeStyle();

                self.disabledClickChoose();
            });
            $nextBtn.on("click",function (){
                pausePlay();
                self.curIndex+=1;
                if(self.curIndex==totalNum){
                    self.curIndex=0;
                    self.moveLeftCount=0;
                    self.moveImgList(self.moveLeftCount);
                    self.checkBtnIsAble();
                }
                self.checkActiveImg();
                changeStyle();
            });


            //关闭按钮
            $closeBtn.on("click", function () {
                self.hide();
                clearInterval(self.myTimer)
            })
        },


        //图片缩放事件
        scaleImg:function(){
            var self=this,
                img=self.popImg;
            var scrollFunc=function(e){
                var direct=0;
                e=e || window.event;

                if(e.wheelDelta){//IE/Opera/Chrome
                    direct=e.wheelDelta;
                }else if(e.detail){//Firefox
                    direct=e.detail;
                }
                ScrollEvent(direct);
            };

            /*注册事件*/
            if(document.addEventListener){
                document.addEventListener('DOMMouseScroll',scrollFunc,false);
            }//W3C
            window.onmousewheel=document.onmousewheel=scrollFunc;//IE/Opera/Chrome/Safari


            //缩放之前的初始值
            var imgW=self.imgWidth,
                imgH=self.imgHeight,
                imgTop=self.imgTop,
                imgLeft=self.imgLeft;

            var sImgW=imgW,
                sImgH=imgH,
                sImgTop=imgTop,
                sImgLeft=imgLeft;

            function ScrollEvent(direct){

                clearInterval(self.myTimer);
                $(".auto-play-btn").attr("isStart","false").removeClass("picture-pause-btn").addClass("picture-start-btn");

                var $imgContainer=$("#J_albumSlider_sm_img"),
                    $viewImg =$imgContainer.find("img"),
                    $fullMask=$imgContainer.find(".top_move_mask"),
                    $moveMask=$imgContainer.find(".move_mask");

                //鼠标滚轮向上时
                if(direct==120 || direct==-3){

                    var start=false;
                    var imgMoveStart=false;

                    sImgW=sImgW*1.02;
                    sImgH=sImgH*1.02;
                    sImgTop=(self.winHeight-sImgH)/2;
                    sImgLeft=(self.winWidth-sImgW)/2;

                    //console.log(sImgTop)

                    img.animate({
                        "width":sImgW+'px',
                        "height":sImgH+'px',
                        "top":sImgTop+'px',
                        "left":sImgLeft+'px'
                    },10);

                    //图片预览图移动

                    var lg_img_w=sImgW;  //原图放大后的的宽度
                    var lg_img_h=sImgH;
                    var screen_w=self.winWidth;
                    var screen_h=self.winHeight;
                    var sm_img_w=230;  //预览图的宽度
                    var sm_img_h=150;
                    var x=Math.max(lg_img_w/sm_img_w,lg_img_h/sm_img_h);  //缩小的倍数

                    sm_img_w=lg_img_w/x;
                    sm_img_h=lg_img_h/x;

                    var move_box_w=screen_w/x>sm_img_w?sm_img_w:screen_w/x;  //移动黑遮罩的宽度
                    var move_box_h=screen_h/x>sm_img_h?sm_img_h:screen_h/x;

                    self.disabledClickChoose();

                    $imgContainer.css({
                        "width":sm_img_w+"px",
                        "height":sm_img_h+"px"
                    });
                    $viewImg.css({
                        "width":sm_img_w+"px",
                        "height":sm_img_h+"px"
                    });
                    $fullMask.css({
                        "width":sm_img_w+"px",
                        "height":sm_img_h+"px"
                    });
                    $moveMask.css({
                        "width":move_box_w+"px",
                        "height":move_box_h+"px",
                        //默认居中
                        "left":(sm_img_w-move_box_w)/2+"px",
                        "top":(sm_img_h-move_box_h)/2+"px"
                    });

                    if(lg_img_w>screen_w || lg_img_h>screen_h){

                        $imgContainer.show();

                        var sm_left=null;
                        var sm_top=null;
                        $fullMask.bind({
                            "mousedown":function(){
                                start=true;
                            },
                            "mousemove":function(event){
                                if(start){
                                    sm_left=event.offsetX-move_box_w/2;
                                    sm_top=event.offsetY-move_box_h/2;
                                    sm_left=sm_left<0?0:sm_left;
                                    sm_left=sm_left>sm_img_w-move_box_w?sm_img_w-move_box_w:sm_left;
                                    sm_top=sm_top<0?0:sm_top;
                                    sm_top=sm_top>sm_img_h-move_box_h?sm_img_h-move_box_h:sm_top;
                                    $moveMask.css({
                                        "left":sm_left+"px",
                                        "top":sm_top+"px"
                                    });

                                    if(lg_img_w>screen_w && lg_img_h>screen_h){
                                        img.css({
                                            "left":-(sm_left)*x+"px",
                                            "top":-(sm_top)*x+"px"
                                        });
                                    }else if(lg_img_w>screen_w && lg_img_h<screen_h){
                                        img.css({
                                            "left":-(sm_left)*x+"px",
                                            "top":sImgTop+"px"
                                        });
                                    }else if(lg_img_w<screen_w && lg_img_h>screen_h){
                                        img.css({
                                            "top":-(sm_top)*x+"px",
                                            "left":sImgLeft+"px"
                                        });
                                    }

                                }
                            },
                            "mouseup":function(){
                                start=false;
                            }
                        });

                        var startX = 0;
                        var startY = 0;
                        img.bind({
                            "mousedown":function(event){
                                startX=event.pageX-this.offsetLeft;
                                startY=event.pageY-this.offsetTop;

                                img.css({
                                    "cursor":"-webkit-grabbing"
                                });
                                imgMoveStart=true;

                            },
                            "mousemove":function(event){

                                if(imgMoveStart){
                                    var nowX=event.pageX-startX;
                                    var nowY=event.pageY-startY;
                                    nowX=nowX>0?0:nowX;  //图片左边距不能大于0
                                    nowX=nowX<screen_w-lg_img_w?screen_w-lg_img_w:nowX;
                                    nowY=nowY>0?0:nowY;
                                    nowY=nowY<screen_h-lg_img_h?screen_h-lg_img_h:nowY;

                                    sm_left=-nowX/x;
                                    sm_top=-nowY/x;
                                    sm_left=sm_left<0?0:sm_left;
                                    sm_left=sm_left>sm_img_w-move_box_w?sm_img_w-move_box_w:sm_left;
                                    sm_top=sm_top<0?0:sm_top;
                                    sm_top=sm_top>sm_img_h-move_box_h?sm_img_h-move_box_h:sm_top;

                                    //console.log(event.offsetX+';'+event.offsetY);
                                    //console.log(event.screenX+';'+event.screenY);
                                    if(lg_img_w>screen_w && lg_img_h>screen_h){
                                        img.css({
                                            "top":nowY+"px",
                                            "left":nowX+"px"
                                        });
                                    }else if(lg_img_w>screen_w && lg_img_h<screen_h){
                                        img.css({
                                            "top":(screen_h-lg_img_h)/2+"px",
                                            "left":nowX+"px"
                                        });
                                    }else if(lg_img_w<screen_w && lg_img_h>screen_h){
                                        img.css({
                                            "top":nowY+"px",
                                            "left":(screen_w-lg_img_w)/2+"px"
                                        });
                                    }


                                    $moveMask.css({
                                        "left":sm_left+"px",
                                        "top":sm_top+"px"
                                    });

                                    return false;
                                }
                            },
                            "mouseup":function(){
                                imgMoveStart=false;
                                img.css({
                                    "cursor":"-webkit-grab"
                                })
                            }
                        })


                    }else{
                        $("#sm_img").hide();
                    }


                } else if(direct==-120 || direct==3){  //鼠标滚轮向下时
                    img.animate({
                        "width":imgW+'px',
                        "height":imgH+'px',
                        "top":imgTop+'px',
                        "left":imgLeft+'px'
                    },100).unbind("mousedown");

                    sImgW=imgW;
                    sImgH=imgH;

                    $imgContainer.hide();

                }
            }

        }

    };


    //在插件中使用AlbumSlider对象
    var pluginName='albumSliderShow';
    $.fn[pluginName] = function(options) {
        this.each(function() {
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName, new AlbumSlider(this, options));
            }
        });
        return this;
    };


    $(function(){

        //自动加载css
        //$('<style type="text/css">' + '' + '</style>').appendTo('head');

        $("[data-role=albumSlider]").albumSliderShow();

        //$(window).resize(function(){
        //    location.reload()
        //})

    })

})(jQuery,window,document);

