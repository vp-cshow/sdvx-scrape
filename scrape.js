import * as cheerio from 'cheerio';
import fetch from 'node-fetch';
import { writeFile } from 'node:fs';

const SDVX_BASE_URL = 'https://p.eagate.573.jp'
const SDVX_SONGLIST_ENDPOINT = '/game/eacsdvx/vi/music/index.html';


function scrapeDetailedPage(endpoint) {

}

function getDifficulty(cheerio_element, api) {
    let difficulty_name = api(cheerio_element).attr()['class'].toUpperCase()
    let difficulty_rating = api(cheerio_element).text()
    return [difficulty_name, difficulty_rating];
}

// [
//     {
//         title: 'title',
//         artist: 'artist',
//         difficulties: {
//             'nov' : ..
//         }
//         pack_name: 'name'
//     }
// ]

let pageNum = 1;
var breakLoop = false;
let songs = []
while (!breakLoop) {
    await fetch(`${SDVX_BASE_URL + SDVX_SONGLIST_ENDPOINT}?page=${pageNum}`)
    .then(res => res.arrayBuffer())
    .then(buffer => {

        const decoder = new TextDecoder('shift_jis');
        const data = decoder.decode(buffer)
        const $ = cheerio.load(data)

        if ($('.music').length == 0) {
            breakLoop = true
            return false;
        }

        $('div.music').each((i, music_div) => {
            $(music_div).find('.jk').each((i, jacket_html) => {
                var detailed_page_endpoint = $($(jacket_html).find('a').get(0)).attr()['href']
                scrapeDetailedPage(detailed_page_endpoint)
            }
            )
            $(music_div).find('.inner').each((i, song_html) => {
                $(song_html).find('.info').each((i, song_html_div) => {

                    // songs metadata -> json
                    var p_tag_cheerios = $(song_html_div).find('p')
                    const title = $(p_tag_cheerios.get(0)).text()
                    const artist = $(p_tag_cheerios.get(1)).text()
                    const diff_nov = getDifficulty(p_tag_cheerios.get(2), $)
                    const diff_adv = getDifficulty(p_tag_cheerios.get(3), $)
                    const diff_exh = getDifficulty(p_tag_cheerios.get(4), $)

                    var diff_special = null
                    var pack_name = null

                    const difficulties = {}
                    difficulties[diff_nov[0]] = diff_nov[1]
                    difficulties[diff_adv[0]] = diff_adv[1]
                    difficulties[diff_exh[0]] = diff_exh[1]

                    if ($(p_tag_cheerios.get(5)).attr()['class'] != undefined) {
                        diff_special = getDifficulty(p_tag_cheerios.get(5), $)
                        pack_name = $(p_tag_cheerios.get(6)).text()
                        difficulties[diff_special[0]] = diff_special[1]
                    }
                    else {
                        pack_name = $(p_tag_cheerios.get(5)).text()
                    }

                    // jackets



                    
                    
                    songs.push({
                        title: title,
                        artist: artist,
                        difficulties: difficulties,
                        pack_name: pack_name
                    })

                })
            })
        })
    })
    pageNum++
}

console.log(songs.length)
let json_string = JSON.stringify(songs, null, 4)
writeFile('./songs.json', json_string, (err) => {})