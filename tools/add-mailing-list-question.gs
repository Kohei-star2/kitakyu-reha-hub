/**
 * 今あるお問い合わせ・参加申込フォームに
 * 「開催案内のメール」のチェック欄を1つ足すスクリプト
 *
 * 使い方
 * 1. Google フォームの編集画面を開く
 * 2. 右上の「︙」→「スクリプト エディタ」（Apps Script）を開く
 * 3. 中身を全部消して、このファイルの中身を貼り付けて保存
 * 4. 関数が「addMailingListQuestion」になっていることを確かめて「実行」→ 権限を許可
 *
 * 1回だけ実行してください（実行するたびに同じ質問が増えます）。
 */
function addMailingListQuestion() {
  var form = FormApp.getActiveForm();
  var item = form.addCheckboxItem()
    .setTitle('開催案内のメール')
    .setHelpText('チェックすると、運営がメーリングリスト（Google グループ）に登録します。ほかの登録者のアドレスは見えません。いつでも退会できます。')
    .setChoiceValues(['今後の開催案内をメールで受け取る']);
  item.setRequired(false);

  // 「内容」の直前に移動する
  var items = form.getItems();
  for (var i = 0; i < items.length; i++) {
    if (items[i].getTitle() === '内容') {
      form.moveItem(item.getIndex(), i);
      break;
    }
  }
  Logger.log('追加しました: ' + form.getEditUrl());
}
