// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

var request = require('request');
// var request = request_cookie.defaults({jar: true});
const { session } = require('electron').remote
const cookies = session.defaultSession.cookies;
var S = require('string');
var get_video_info = "https://drive.google.com/get_video_info?docid=";

var player = videojs('video');
var cookieSet = '';
var source = [];
const getVideoResolution = (itag) => {
  var videoCode = {
    '18': 360,
    '59': 480,
    '22': 720,
    '37': 1080
  }
  return videoCode[itag] || 0
}

const getVideoLabel = (itag) => {
  var videoCode = {
    '18': 'SD 360p',
    '59': 'SD 480p',
    '22': 'HD 720p',
    '37': 'HD 1080p'
  }
  return videoCode[itag] || 0
}

$('#mySelect').on('change', function() {
  var value = $(this).val();
  getSecondVideoUrl(value);
});

$("#divVideo").hide();
$("#spin").hide();

$("#btnVideo").click(function(){
    $("#spin").show();
    $("#container").hide();
    getVideoUrl(0);
   
});

$("#btnBack").click(function(){
    player.pause();
    get_video_info = "https://drive.google.com/get_video_info?docid=";
    $("#mySelect").empty();
    $("#divVideo").hide();
    $('#txtVideo').val("");
    $("#spin").hide();
    $("#container").show();
});


function getSecondVideoUrl(id){
    $("#txtDocId").show();
    cookies.set({
      url:source[id].src,
      name:'DRIVE_STREAM',
      value:cookieSet,
      domain:'.drive.google.com',
      path:'/',
      httpOnly:true
    }, (error, cookie) => {
        player.src(source[id]);
        player.play();  
    });
}

// getVideoUrl(0);
function getVideoUrl(id){
  get_video_info = get_video_info+$("#txtVideo").val().split('/')[5];
  // console.log(get_video_info);
	request(get_video_info, (error, response, body) => {
    cookieSet = S(response.headers['set-cookie']).between('DRIVE_STREAM=', ';').s;
	  if (body.includes('fmt_stream_map=')) {
        $("#divVideo").show();
  		  var fmt_stream_map = S(body).between('fmt_stream_map=', '&').s;
          var links = decodeURIComponent(fmt_stream_map).split(',');
          source = links.map(itagAndUrl => {
            const [itag, url] = itagAndUrl.split('|')
            const result = {
              src: url,
              type: 'video/mp4',
              label: getVideoLabel(itag),
              res: getVideoResolution(itag)
            }
            return result;
          }).filter(video => video.label !== 0);
          cookies.set({
            url:source[id].src,
            name:'DRIVE_STREAM',
            value:cookieSet,
            domain:'.drive.google.com',
            path:'/',
            httpOnly:true
          }, (error, cookie) => {
              $("#spin").hide();
              player.src(source[id]);
              player.play();  
              $("#mySelect").append(source[0] ? new Option('SD 360p >', 0, true) : null);            
              $("#mySelect").append(source[1] ? new Option('SD 480p >', 1) : null);            
              $("#mySelect").append(source[2] ? new Option('HD 720p >', 2) : null);            
              $("#mySelect").append(source[3] ? new Option('HD 1080p >', 3) : null);            
          });
                    
	  }else{
        alert('Link Error');
        get_video_info = "https://drive.google.com/get_video_info?docid=";
        $("#spin").hide();
        $("#container").show();
    }
	});
}