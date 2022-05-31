const URL = require('url')

const urlFromComponents=({pathname = '/', protocol = 'https:',...props} = {})=>{
    const url = new URL.URL('https://site.example');
    url.protocol = protocol;
    url.hostname = props.HOST_NAME;
    url.pathname = props.PATH_NAME;
    return url;
}

module.exports = urlFromComponents