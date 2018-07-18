function GoodReads() {
    var query = SpreadsheetApp.getActiveRange().getValue();
    var book = searchBooks_(query);

    // Write Data to Google Spreadsheet.
    if (book) {
        var sheet = SpreadsheetApp.getActiveSheet();
        sheet.appendRow([book.title, book.author, "", book.avg_rating, book.pages, book.year]);
    }

}

function searchBooks_(query) {

    var baseUrl = "https://www.goodreads.com/book/show/",
        apiUrl = "https://www.goodreads.com/search/index.xml",
        apiKey = "API_KEY",
        searchResults = [],
        payload = {
            q: query,
            key: apiKey
        },
        params = {
            method: "GET",
            payload: payload,
            muteHttpExceptions: true
        };

    var response = UrlFetchApp.fetch(apiUrl, params);

    if (response.getResponseCode() === 200) {
        var xml = XmlService.parse(response.getContentText());
        var id = xml.getRootElement().getChild('search').getChild('results').getChildren('work')[0].getChild('best_book').getChild('id').getText();
        if (id) {
            var bookResponse = UrlFetchApp.fetch(baseUrl + id + ".xml?key=" + apiKey);
            if (bookResponse.getResponseCode() === 200) {
                var book = XmlService.parse(bookResponse.getContentText()).getRootElement().getChild('book');
                return {
                    title: book.getChild("title").getText(),
                    author: book.getChildren("authors")[0].getChild("author").getChild("name").getText(),
                    avg_rating: book.getChild("average_rating").getText(),
                    pages: book.getChild("num_pages").getText(),
                    year: book.getChild("publication_year").getText() || book.getChild("work").getChild("original_publication_year").getText()
                };
            }
        }

    }

}
