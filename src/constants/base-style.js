import {dimensions, fontSize} from './util'

export const colors = {
  white: "#ffffff",
  slate: "#3a4859",
  coralLight: "#ff8d69",
  coral: "#ff5d39",
  turquoise_green: "#08e298",
  dark: "#273444",
  blueGrey: "#8492a6",
  teal: "#00a66e",
  cloudyBlue: "#ccd4df",
  paleGrey: "#dfe3ee",
  paleGreyThree: "#eff2f7",
  goldenYellow: "#f8d31c",
  slateTwo: "rgba(60, 72, 88, 0.86)",
  greenBlue: "#02cd89",
  blue: '#1d55b8',
  green: '#8492a6',
  black: "#000000",
  screenBackground: '#f9fafc',
  dividerColor: '#DFE3EE',
  itemizationColor: '#9aa4a0',
  cleaningColor: '#08e298',
  dcItemizationColor: '#252D29',
  errorColor: '#FE0D2A',
};

export const FontFamily = {
  FontRegular: "WorkSans-Regular",
  FontMedium: "WorkSans-Medium",
  FontLight: "WorkSans-Light",
  FontSemiBold: "WorkSans-SemiBold",
  FontBold: "WorkSans-Bold"
}

export const HeaderStyle = {
    width: '100%',
    height: dimensions.height * 0.08,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 0,
    paddingRight: 0,
    backgroundColor: colors.screenBackground,
}

export const ContentWithHeaderStyle = {
    width: '100%',
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.screenBackground,
}

export const ContentCentered = {
    alignContent: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: '100%',
    flexDirection: 'column',
}

export const ContentRow = {
    backgroundColor: colors.white,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginLeft: '8%',
    width: '84%',
    padding: fontSize(6),
    marginTop: fontSize(10),
}

export const ContentStyle = {
    width: '75%',
    height: '100%',
    backgroundColor: colors.screenBackground,
}

export const ContentStyleWithLeftAndRightSidebar = {
    flex: 1,
    height: '100%',
    width: '50%',
    backgroundColor: colors.screenBackground,
}

export const ContentSmall = {
    flex: 0.5,
    height: '100%',
    width: '50%',
    padding: fontSize(10),
    backgroundColor: colors.screenBackground,
}


export const SidebarStyle = {
    flex: 0.5,
    minHeight: '100%',
    backgroundColor: colors.screenBackground,
    flexDirection: 'column',
    alignItems: "flex-start",
    borderWidth: 0.5,
    borderColor: colors.blueGrey,
    borderBottomWidth: 0,
    borderTopWidth: 0,
}

export const KeyboardStyle = {
    width: '100%',
    flex: 1,
    backgroundColor: colors.white,
    flexDirection: 'column',
    alignItems: "stretch",
    borderColor: colors.blueGrey,
    borderLeftWidth: 0.5,
    flexWrap: 'nowrap',
}

export const Table = {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    width: '100%',
    height: '50%'
}

export const TableRow = {
    flex: 1,
    alignSelf: 'stretch',
    flexDirection: 'row',
    width: '100%',
    height: '100%',
}

export const TableCell = {
    flex: 1,
    alignSelf: 'stretch',
    width: '33%',
    height: fontSize(50),
    backgroundColor: colors.white,
}

export const divider = {
    borderWidth: 0.5,
    borderColor: colors.dividerColor,
    marginTop: 2,
    marginBottom: 2,
    height: 1,
    width: '100%',
    backgroundColor: colors.dividerColor,
}

export const hr = {
    borderWidth: 0.5,
    borderColor:colors.screenBackground,
    marginTop: 0,
    marginBottom: 0,
    height: 1,
    width: '100%',
    backgroundColor: colors.screenBackground,
}

export const HEADER = {
    color: colors.white,
    fontSize: fontSize(13),
    lineHeight: fontSize(16),
}

export const BIG_ICON = {
    height: fontSize(30),
    width: fontSize(30),
    resizeMode: 'contain'
}

export const TASK_DATA_HEADER = {
    padding: fontSize(3),
    fontSize: fontSize(8),
    fontWeight: "normal",
    fontStyle: "normal",
    lineHeight: fontSize(14),
    letterSpacing: 0.25,
    textAlign: "left",
    justifyContent: 'center',
    alignItems: 'center',
    color: colors.itemizationColor,
}

export const TASK_DATA = {
    padding: fontSize(3),
    fontSize: fontSize(8),
    fontWeight: "normal",
    fontStyle: "normal",
    lineHeight: fontSize(10),
    letterSpacing: 0.25,
    textAlign: "left",
    justifyContent: 'center',
    color: colors.black,
}

export const GRID = {
    paddingTop: fontSize(15),
    flex: 1,
}

export const GRID_ITEM = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: fontSize(50),
}

export const NO_INTERNET_BAR = {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
}

export const NO_INTERNET_MESSAGE = {
    width: '100%',
    height: fontSize(18),
    lineHeight: fontSize(18),
    fontSize: fontSize(8),
    textAlign: "center",
    backgroundColor: colors.errorColor,
    color: colors.white
}

export const itemizationItem = {
    padding: fontSize(3),
    fontSize: fontSize(10),
    lineHeight: fontSize(10),
    letterSpacing: 0.25,
    textAlign: "left",
    justifyContent: 'center',
    color: colors.dark
}

export const SUBMIT = {
    width: '100%',
    height: fontSize(45),
    flexDirection: 'row',
}

export const LOGO_WRAPPER = {
    marginLeft: '10%',
    width: '80%',
    height: '25%',
    alignItems: 'center'
}

export const LOGO = {
    width: '100%',
    height: '100%',
    resizeMode: 'contain'
}

export const BAG = {
    borderWidth: 1,
    borderColor: colors.dividerColor,
    backgroundColor: colors.white,
    width: '84%',
    marginLeft: '8%',
    borderRadius: 5,
    padding: 10,
    marginTop: fontSize(10)
}

export const BAG_SHADOW = {
    borderWidth: 1,
    borderColor: colors.dividerColor,
    backgroundColor: colors.white,
    width: '80%',
    marginLeft: '10%',
    borderRadius: 5,
    padding: 10,
    marginBottom: fontSize(10),

    shadowColor: colors.dividerColor,
    shadowOffset: 3,
    shadowOpacity: 0.5,
    shadowRadius: 0.5,
}