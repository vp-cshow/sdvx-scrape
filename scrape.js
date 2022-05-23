import * as cheerio from 'cheerio';
import fetch from 'node-fetch';

const SDVX_SONGLIST_BASE_URL = 'https://p.eagate.573.jp/game/eacsdvx/vi/music/index.html';

function getDifficulty(cheerio_element, api) {
    return api(cheerio_element).attr()['class'].toUpperCase() + ' ' + api(cheerio_element).text();
}
 
fetch(SDVX_SONGLIST_BASE_URL)
.then(res => res.arrayBuffer())
.then(buffer => {
    const decoder = new TextDecoder('shift_jis');
    const data = decoder.decode(buffer)
    const $ = cheerio.load(data)
    $('div.music').each((i, music_div) => {
        $(music_div).find('.inner').each((i, song_html) => {
            $(song_html).find('.info').each((i, song_html_div) => {
                var p_tag_cheerios = $(song_html_div).find('p')
                const title = $(p_tag_cheerios.get(0)).text()
                const artist = $(p_tag_cheerios.get(1)).text()
                const diff_nov = getDifficulty(p_tag_cheerios.get(2), $)
                const diff_adv = getDifficulty(p_tag_cheerios.get(3), $)
                const diff_exh = getDifficulty(p_tag_cheerios.get(4), $)
                var diff_special = null
                var pack_name = null
                if ($(p_tag_cheerios.get(5)).attr()['class'] != undefined) {
                    diff_special = getDifficulty(p_tag_cheerios.get(5), $)
                    pack_name = $(p_tag_cheerios.get(6)).text()
                }
                else {
                    pack_name = $(p_tag_cheerios.get(5)).text()
                }
                const difficulties = []
                difficulties.push(diff_nov)
                difficulties.push(diff_adv)
                difficulties.push(diff_exh)
                if (diff_special != null) {
                    difficulties.push(diff_special)
                }
                console.log(`Title: ${title}, Difficulties: ${difficulties.join(' | ')} Artist: ${artist}, Pack Name: ${pack_name}`)
            })
        })
    })
}) 
        
