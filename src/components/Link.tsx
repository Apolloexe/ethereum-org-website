import React from "react"
import { Icon, Link as ChakraLink, LinkProps, useTheme } from "@chakra-ui/react"
import { navigate as gatsbyNavigate } from "gatsby"
import { Link as IntlLink } from "gatsby-plugin-react-i18next"
import { NavigateOptions } from "@reach/router"

import { BsQuestionSquareFill } from "react-icons/bs"

import { Lang } from "../utils/languages"
import { trackCustomEvent, EventOptions } from "../utils/matomo"
import * as url from "../utils/url"
import { Direction } from "../types"

export interface IBaseProps {
  to?: string
  href?: string
  language?: Lang
  hideArrow?: boolean
  isPartiallyActive?: boolean
  customEventOptions?: EventOptions
}

export interface IProps extends IBaseProps, LinkProps {
  dir?: Direction // TODO: remove this prop once we use the native Chakra RTL support
}

/**
 * Link wrapper which handles:
 *
 * - Hashed links
 * e.g. <Link href="/page-2/#specific-section">
 *
 * - External links
 * e.g. <Link href="https://example.com/">
 *
 * - PDFs & static files (which open in a new tab)
 * e.g. <Link href="/eth-whitepaper.pdf">
 *
 * - Intl links
 * e.g. <Link href="/page-2/" language="de">
 */
const Link: React.FC<IProps> = ({
  to: toProp,
  href,
  language,
  dir = "ltr",
  children,
  hideArrow = false,
  isPartiallyActive = true,
  customEventOptions,
  ...restProps
}) => {
  const theme = useTheme()

  // TODO: in the next PR we are going to deprecate the `to` prop and just use `href`
  // this is to support the ButtonLink component which uses the `to` prop
  const to = (toProp ?? href)!

  const isExternal = url.isExternal(to)
  const isHash = url.isHash(to)
  const isGlossary = url.isGlossary(to)
  const isStatic = url.isStatic(to)
  const isPdf = url.isPdf(to)

  const eventOptions: EventOptions = {
    eventCategory: `External link`,
    eventAction: `Clicked`,
    eventName: to,
  }

  const commonProps = {
    dir,
    ...restProps,
  }

  // Must use Chakra's native <Link> for anchor links
  // Otherwise the Gatsby <Link> functionality will navigate to homepage
  // See https://github.com/gatsbyjs/gatsby/issues/21909
  if (isHash) {
    return (
      <ChakraLink href={to} {...commonProps}>
        {children}
      </ChakraLink>
    )
  }

  // Download link for internally hosted PDF's & static files (ex: whitepaper)
  // Opens in separate window.
  if (isExternal || isPdf || isStatic) {
    return (
      <ChakraLink
        href={to}
        isExternal
        _after={{
          content: !hideArrow ? '"↗"' : undefined,
          ml: 0.5,
          mr: 1.5,
        }}
        onClick={(e) => {
          // only track events on external links
          if (!isExternal) {
            return
          }

          e.stopPropagation()
          trackCustomEvent(
            customEventOptions ? customEventOptions : eventOptions
          )
        }}
        {...commonProps}
      >
        {children}
      </ChakraLink>
    )
  }

  // Use `gatsby-theme-i18n` Link (which prepends lang path)
  return (
    <ChakraLink
      to={to}
      as={IntlLink}
      language={language}
      partiallyActive={isPartiallyActive}
      activeStyle={{ color: theme.colors.primary }}
      whiteSpace={isGlossary ? "nowrap" : "normal"}
      {...commonProps}
    >
      {children}
      {isGlossary && (
        <Icon
          as={BsQuestionSquareFill}
          aria-label="See definition"
          fontSize="12px"
          margin="0 0.25rem 0 0.35rem"
          _hover={{
            transition: "transform 0.1s",
            transform: "scale(1.2)",
          }}
        />
      )}
    </ChakraLink>
  )
}

export function navigate(
  to: string,
  language: Lang,
  options?: NavigateOptions<{}>
) {
  if (typeof window === "undefined") {
    return
  }

  const link = `/${language}${to}`
  gatsbyNavigate(link, options)
}

export default Link
