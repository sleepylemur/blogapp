#blogapp

ERD diagram:

```
articles
1|   1\
 |     \
  \    *\sections
   \
    \  
    |        
    |*   *    1
 comments------users
 1|   *| 
  |    |
  |____/

```


- front page:
  
  - list of articles with cover photo, summary, and link to the article.
  edit button up top with a link to the author's view of the site

- article page:

  - laid out sections with the section images and text

  - at the bottom of the page have a nested list of comments

  - right above the comments have a "leave comment" button that pops open a modal comment form

  - after each comment have a small "reply" button that pops open a modal comment form


- authors edit articles page:

  - a list of article titles with edit delete and show/hide buttons

- authors edit article page:
  
  - the summary section, with the frontpage image and summary

  - a wysiwyg list of sections, with tabs at the top. one for preview, one for edit.
   
    - when the edit tab is selected, the whole section is displayed as a form with fields to edit.
   
    - when the preview tab is selected, the section is rendered as the user would see it