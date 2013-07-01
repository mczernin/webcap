var r = new XMLHttpRequest();  

r.onreadystatechange = function() {
    var j = JSON.parse(r.response);
    if (j.image == null) return;
    
    console.log(j);
    window.location.href = 'data:image/png;charset=utf-8;base64,'+ j.image;
};

r.open('POST', 'http://example.com:5000/webcap', true);
r.send(JSON.stringify({url:'http://fox.com'}));

delete r;
