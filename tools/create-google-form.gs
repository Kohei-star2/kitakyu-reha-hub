/**
 * 北九州リハビリテーションハブ研究会
 * お問い合わせ・参加申込フォームを自動で作るスクリプト
 *
 * 使い方
 * 1. https://script.google.com を開き「新しいプロジェクト」
 * 2. 最初からある中身を全部消して、このファイルの中身を貼り付けて保存
 * 3. 上の関数の選択が「createForm」になっていることを確かめて「実行」
 * 4. 初回だけ権限の確認が出るので、自分のアカウントで許可
 * 5. 下の「実行ログ」に出る「公開URL」をコピーする
 *
 * 何度実行しても、そのたびに新しいフォームが1つできます（前のものは消えません）。
 */
function createForm() {
  var form = FormApp.create('お問い合わせ・参加申込｜北九州リハビリテーションハブ研究会');

  form.setDescription(
    '問い、語り、共に本質を探究する\n\n' +
    '本質観取の会への参加申込、会についての質問、取材、一緒に活動したいというご相談は、こちらからお送りください。数日以内にお返事します。\n\n' +
    '医療職の方も、学生や一般の方も参加できます。\n' +
    'いただいた情報は、会の運営とお問い合わせへの返信のためだけに使います。'
  );
  form.setConfirmationMessage('送信しました。ありがとうございます。数日以内にメールでお返事します。');
  form.setAllowResponseEdits(false);
  form.setShowLinkToRespondAgain(false);
  form.setLimitOneResponsePerUser(false); // Googleアカウントがなくても送れるように
  form.setProgressBar(false);

  form.addMultipleChoiceItem()
    .setTitle('お問い合わせの種類')
    .setChoiceValues(['参加申込', '会について質問', '取材', '一緒に活動したい', 'その他'])
    .setRequired(true);

  form.addTextItem()
    .setTitle('お名前')
    .setRequired(true);

  var emailCheck = FormApp.createTextValidation()
    .setHelpText('メールアドレスの形で入力してください')
    .requireTextIsEmail()
    .build();
  form.addTextItem()
    .setTitle('メールアドレス')
    .setHelpText('お返事に使います')
    .setValidation(emailCheck)
    .setRequired(true);

  form.addTextItem()
    .setTitle('職種')
    .setHelpText('例：理学療法士、看護師、医師、学生、一般 など（任意）');

  form.addTextItem()
    .setTitle('参加希望の回')
    .setHelpText('参加申込の方のみ。例：第4回（任意）');

  var lengthCheck = FormApp.createParagraphTextValidation()
    .setHelpText('2000文字以内で入力してください')
    .requireTextLengthLessThanOrEqualTo(2000)
    .build();
  form.addParagraphTextItem()
    .setTitle('内容')
    .setHelpText('参加申込の方は、ひとことでも大丈夫です')
    .setValidation(lengthCheck)
    .setRequired(true);

  // 回答をスプレッドシートにも記録する
  var sheet = SpreadsheetApp.create('お問い合わせ・参加申込（回答）｜北九州リハビリテーションハブ研究会');
  form.setDestination(FormApp.DestinationType.SPREADSHEET, sheet.getId());

  Logger.log('公開URL（これをサイトに設定します）: ' + form.getPublishedUrl());
  Logger.log('編集URL（フォームの見た目や質問を直すとき）: ' + form.getEditUrl());
  Logger.log('回答のスプレッドシート: ' + sheet.getUrl());
}
