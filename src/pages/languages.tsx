import React, { useState } from "react"
import { graphql } from "gatsby"
import styled from "@emotion/styled"
import { useTranslation } from "gatsby-plugin-react-i18next"

import PageMetadata from "../components/PageMetadata"
import Translation from "../components/Translation"
import Link from "../components/Link"
import { Page, Content } from "../components/SharedStyledComponents"

import { Language, languageMetadata } from "../utils/languages"
import { TranslationKey } from "../utils/translations"
import { CardItem as LangItem } from "../components/SharedStyledComponents"
import Icon from "../components/Icon"
import NakedButton from "../components/NakedButton"

const StyledPage = styled(Page)`
  margin-top: 4rem;
`

const ContentContainer = styled.div``

const LangContainer = styled.div`
  margin-top: 2rem;
  margin-bottom: 2rem;
  display: flex;
  flex-wrap: wrap;
  width: 100%;
`

const LangTitle = styled.div`
  font-size: 0.875rem;
  line-height: 1.6;
  font-weight: 400;
  letter-spacing: 0.04em;
  margin: 1.14em 0;
  text-transform: uppercase;
`

const Form = styled.form`
  margin: 0;
  position: relative;
  border-radius: 0.25em;
  width: clamp(min(400px, 100%), 50%, 600px);
`

const StyledInput = styled.input`
  border: 1px solid ${(props) => props.theme.colors.searchBorder};
  color: ${(props) => props.theme.colors.text};
  background: ${(props) => props.theme.colors.searchBackground};
  padding: 0.5rem;
  padding-right: 2rem;
  border-radius: 0.25em;
  width: 100%;

  &:focus {
    outline: ${(props) => props.theme.colors.primary} auto 1px;
  }
`

const IconButton = styled(NakedButton)`
  position: absolute;
  top: 50%;
  margin-top: -12px;
  right: 6px;
`

const ResetIcon = styled(Icon)`
  fill: ${(props) => props.theme.colors.text};
`

interface TranslatedLanguage extends Language {
  path: string
}

const LanguagesPage = () => {
  const { t } = useTranslation()
  const [keyword, setKeyword] = useState<string>("")
  const resetKeyword = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setKeyword("")
  }
  const searchString = t("page-languages-filter-placeholder")
  let translationsCompleted: Array<TranslatedLanguage> = []
  for (const lang in languageMetadata) {
    const langMetadata = {
      ...languageMetadata[lang],
      path: "/",
      name: t(`language-${lang}` as TranslationKey),
    }

    const nativeLangTitle = langMetadata.localName
    const englishLangTitle = langMetadata.name
    if (
      englishLangTitle.toLowerCase().includes(keyword.toLowerCase()) ||
      nativeLangTitle.toLowerCase().includes(keyword.toLowerCase())
    ) {
      translationsCompleted.push(langMetadata)
    }
  }
  translationsCompleted.sort((a, b) => a["name"].localeCompare(b["name"]))

  return (
    <StyledPage>
      <PageMetadata
        title={t("page-languages-meta-title")}
        description={t("page-languages-meta-desc")}
      />
      <Content>
        <ContentContainer>
          <h1>
            <Translation id="page-languages-h1" />
          </h1>
          <p>
            <Translation id="page-languages-p1" />
          </p>
          <p>
            <Translation id="page-languages-interested" />{" "}
            <Link to="/contributing/translation-program/">
              <Translation id="page-languages-learn-more" />
            </Link>
            .
          </p>
          <p>
            <Translation id="page-languages-resources-paragraph" />{" "}
            <Link to="/community/language-resources">
              <Translation id="page-languages-resources-link" />
            </Link>
            .
          </p>
          <h2>
            <Translation id="page-languages-translations-available" />:
          </h2>
          <Form>
            <StyledInput
              value={keyword}
              placeholder={searchString}
              onChange={(e) => setKeyword(e.target.value)}
            />
            {keyword === "" ? null : (
              <IconButton onClick={resetKeyword}>
                <ResetIcon name="close" />
              </IconButton>
            )}
          </Form>
          <LangContainer>
            {translationsCompleted.map((lang) => (
              <LangItem to={lang.path} language={lang.code} key={lang["name"]}>
                <LangTitle>{lang["name"]}</LangTitle>
                <h4>{lang.localName}</h4>
              </LangItem>
            ))}
          </LangContainer>
          <h2>
            <Translation id="page-languages-want-more-header" />
          </h2>
          <p>
            <Translation id="page-languages-want-more-paragraph" />{" "}
            <Link to="/contributing/translation-program/">
              <Translation id="page-languages-want-more-link" />
            </Link>
            .
          </p>
        </ContentContainer>
      </Content>
    </StyledPage>
  )
}

export default LanguagesPage

export const query = graphql`
  query LanguagesPage($languagesToFetch: [String!]!) {
    locales: allLocale(filter: { language: { in: $languagesToFetch } }) {
      edges {
        node {
          ns
          data
          language
        }
      }
    }
  }
`
