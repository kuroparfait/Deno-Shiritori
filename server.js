import {serve} from
"https://deno.land/std@0.138.0/http/server.ts";
import {serveDir} from
"https://deno.land/std@0.138.0/http/file_server.ts";

let previousWord = "しりとり";
const wordDB = [];
const regexp = /^[\u{3041}-\u{3093}\u{30fc}]+$/mu;
console.log("Listening on http://localhost:8000");

serve(async (req) => {
    const pathname = new URL(req.url).pathname;
    console.log(pathname);
    if (req.method === "GET" && pathname === "/shiritori") {
        return new Response(previousWord);
    }
    if (req.method === "POST" && pathname === "/shiritori") {
        const requestJson = await req.json();
        const nextWord = requestJson.nextWord;
        if (nextWord.length > 0 && regexp.test(nextWord) !== true) {
            return new Response("全てひらがなで入力してください。",{ status:400});
        }
        if (
            nextWord.length > 0 && previousWord.charAt(previousWord.length - 1) !== nextWord.charAt(0)
        ) {
            return new Response("前の単語に続いていません。",{ status:400});
        }
        else if (
            nextWord.length > 0 && nextWord.charAt(nextWord.length - 1) === 'ん'
        ) {
             wordDB.length = 1;
             previousWord = "りんご";
             return new Response("「ん」で終わったのでゲームを終了します",{ status:400});
        }
        else if(
            nextWord.length > 0 && wordDB.includes(nextWord) > 0
        ){
            return new Response("入力された単語は登録済です",{ status:400});
        }
        previousWord = nextWord;
        wordDB.push(previousWord);
        for (const item of wordDB) {
            console.log(item);   
        }
        return new Response(previousWord);
  
    }

    return serveDir(req, {
        fsRoot:"public",
        urlRoot:"",
        showDirListing: true,
        enableCors: true,
    });
}); 