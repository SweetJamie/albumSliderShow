/**
 * Created by jamie on 2016/2/15.
 */

;
(function ($, window, document, undefined) {

    var defaults = {
        'width': '100%',
        'height': '100%'
    };

    function OnePicViewer(ele, opt) {
        var self = this;

        this.element = ele;
        this.$imgContainer = $(ele);
        this.options = $.extend({}, defaults, opt);


        self.init();

    }

    OnePicViewer.prototype = {

        init: function () {
            var self = this,
                element = self.element;

            self.createViewer(element);
            self.setStyle(element);
        },

        createViewer: function (ele) {
            var $imgContainer = $(ele),
                $img = $(ele).find(".J_onePicViewer_lg_img");

            var img = $img.get(0);

            var imgSrc = $imgContainer.find(".J_onePicViewer_lg_img").attr("src");
            var smImgHtml = '<div class="J_onePicViewer_sm_img">' +
                '<img src="' + imgSrc + '">' +
                '<div class="move_mask"></div>' +
                '<div class="top_move_mask"></div></div>';

            $imgContainer.append(smImgHtml);

        },

        disabledClickChoose: function () {

            if (document.all) {
                document.onselectstart = function () {
                    return false;
                }; //for ie
            } else {
                document.onmousedown = function () {
                    return false;
                };
                document.onmouseup = function () {
                    return true;
                };
            }
            document.onselectstart = new Function('event.returnValue=false;');
        },

        setStyle:function(ele){
            var self=this,
                $imgContainer=$(ele),
                $curImg=$imgContainer.find(".J_onePicViewer_lg_img"),
                curImg=$curImg.get(0),
                conWidth=self.options.width,
                conHeight=self.options.height;

            $imgContainer.css({
                'width':conWidth,
                'height':conHeight
            });


            var
                $viewer=$(".J_onePicViewer_sm_img"),
                $viewImg=$viewer.find("img"),
                $moveMask=$viewer.find(".move_mask"),
                $fullMask=$viewer.find(".top_move_mask");

            var screen_w=$imgContainer.width(),
                screen_h=$imgContainer.height(),
                lg_img_w=$curImg.width(),
                lg_img_h=$curImg.height();


            $curImg.css({
                left:(screen_w-lg_img_w)/2+'px',
                top:(screen_h-lg_img_h)/2+'px'
            }).hide().show(10);

            var sm_img_w=230,  //预览图的宽度
                sm_img_h=150,
                x=Math.max(lg_img_w/sm_img_w,lg_img_h/sm_img_h);

            sm_img_w=lg_img_w/x;
            sm_img_h=lg_img_h/x;

            var move_box_w=screen_w/x>sm_img_w?sm_img_w:screen_w/ x,  //移动黑遮罩的宽度
                move_box_h=screen_h/x>sm_img_h?sm_img_h:screen_h/x;


            if(lg_img_w>screen_w || lg_img_h>screen_h){

                $viewer.css({
                    "width":sm_img_w+"px",
                    "height":sm_img_h+"px"
                }).show();
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

                self.viewPic(lg_img_w,lg_img_h,sm_img_w,sm_img_h,screen_w,screen_h,move_box_w,move_box_h,x);
            }


        },

        viewPic:function(lg_img_w,lg_img_h,sm_img_w,sm_img_h,screen_w,screen_h,move_box_w,move_box_h,x){
            var self=this;

            if(lg_img_w>screen_w || lg_img_h>screen_h){

                var $imgContainer=self.$imgContainer,
                    img=$imgContainer.find(".J_onePicViewer_lg_img"),
                    $viewer=$(".J_onePicViewer_sm_img"),
                    $moveMask=$viewer.find(".move_mask"),
                    $fullMask=$viewer.find(".top_move_mask");

                var start=false;
                var imgMoveStart=false;
                var sm_left=null;
                var sm_top=null;
                $fullMask.bind({
                    "mousedown":function(){
                        start=true;
                    },
                    "mousemove":function(event){
                        if(start && imgMoveStart==false){
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
                                    "top":(screen_h-lg_img_h)/2+"px"
                                });
                            }else if(lg_img_w<screen_w && lg_img_h>screen_h){
                                img.css({
                                    "top":-(sm_top)*x+"px",
                                    "left":(screen_w-lg_img_w)/2+"px"
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
                    "mouseover":function(){
                        img.css({
                            "cursor":"-webkit-grab"
                        })
                    },
                    "mousedown":function(event){
                        startX=event.pageX-this.offsetLeft;
                        startY=event.pageY-this.offsetTop;
                        imgMoveStart=true;
                        //console.log(event.pageX+";"+this.offsetLeft)
                        //console.log(startX+";"+startY)
                        img.css({
                            "cursor":"-webkit-grabbing"
                        })
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
                        //imgMoveStart=false;
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
        }


    };

    //在插件中使用AlbumSlider对象
    var pluginName = 'onePicViewer';
    $.fn[pluginName] = function (options) {
        this.each(function () {
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName, new OnePicViewer(this, options));
            }
        });
        return this;
    };

})(jQuery, window, document);