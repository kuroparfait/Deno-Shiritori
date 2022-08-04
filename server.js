import {serve} from
"https://deno.land/std@0.138.0/http/server.ts";
import {serveDir} from
"https://deno.land/std@0.138.0/http/file_server.ts";

let previousWord = "しりとり"; //前の単語
const wordDB = []; //使用した単語を登録する配列
let wordLength = 3; //wordLength...文字数指定
const regexp = /^[\u{3041}-\u{3093}\u{30fc}]+$/mu; //正規表現：ひらがなと”－(伸ばし棒)”
console.log("Listening on http://localhost:8000");

serve(async (req) => {
    const pathname = new URL(req.url).pathname;
    console.log(pathname);
    let lastLetter = previousWord.charAt(previousWord.length - 1); //lastLetter...最後の文字
    if (lastLetter === 'ー') {
        lastLetter = previousWord.charAt(previousWord.length - 2); //最後の文字が「ー」の場合、その１つ前の文字を指定
    }
    console.log(previousWord);
    if (req.method === "GET" && pathname === "/shiritori") {
        const res =previousWord+wordLength+lastLetter;
        return new Response (res);
    }
    if (req.method === "POST" && pathname === "/shiritori") {
        const requestJson = await req.json();
        const nextWord = requestJson.nextWord; //入力された単語

        console.log(lastLetter);
        console.log(wordLength);
        if (nextWord.length > 0 && regexp.test(nextWord) !== true) { //入力された単語にひらがなまたは”－”以外が含まれる場合無効
            return new Response("全てひらがなで入力してください。",{ status:400});
        }
        else if (
            nextWord.length > 0 && lastLetter !== nextWord.charAt(0) //しりとりが成立していない場合無効
        ) {
            return new Response("前の単語に続いていません。",{ status:400});
        }
        else if (
            nextWord.length > 0 && lastLetter === 'ん'
        ) {
             wordDB.length = 1; //「ん」で終わった場合ゲーム終了しはじめの状態に戻す
             previousWord = "りんご";
             wordLength = 2+Math.floor(Math.random() * 7);
             console.log(wordLength);
             return new Response("「ん」で終わったのでゲームを終了します",{ status:400});
        }
        else if(
            nextWord.length > 0 && wordDB.includes(nextWord) > 0 //入力された単語が配列内に１つでもある場合無効
        ){
            return new Response("入力された単語は登録済です",{ status:400});
        }
        else if(
            (nextWord.length > 0 && wordLength < 8 && nextWord.length !== wordLength) ||
            (nextWord.length > 0 && wordLength === 8 && nextWord.length <= 8) //入力された単語が指定の文字数と一致しない（wordLength=8の場合は8未満）場合無効
        ){
            return new Response("文字数が違います。",{ status:400});
        }
        previousWord = nextWord;
        wordDB.push(previousWord); //配列に単語を登録
        for (const item of wordDB) {
            console.log(item);   //登録済みの単語をコンソールに表示
        }

        wordLength = 2+Math.floor(Math.random() * 7); //ランダムで次の単語の文字数を指定(2字～7字＋8字以上)
        console.log(wordLength);
        return new Response(previousWord);
    }

    return serveDir(req, {
        fsRoot:"public",
        urlRoot:"",
        showDirListing: true,
        enableCors: true,
    });
}); 