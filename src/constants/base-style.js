import { fontSize } from './util'

export const colors = {
  white: "#ffffff",
  slate: "#3a4859",
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
    height: '8%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 10,
    backgroundColor: colors.screenBackground,
}

export const ContentWithHeaderStyle = {
    width: '100%',
    height: '92%',
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
    marginLeft: '10%',
    width: '80%',
    padding: fontSize(10),
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
    height: 50,
    backgroundColor: colors.white,
}

export const hr = {
    borderWidth: 0.5,
    borderColor:colors.dividerColor,
    marginTop: 8,
    marginBottom: 8,
    height: 1,
    width: '100%',
    backgroundColor: colors.teal,
}

export const HEADER = {
    color: colors.white,
    fontSize: fontSize(13),
    lineHeight: fontSize(16),
    backgroundColor: colors.dark
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
    lineHeight: fontSize(10),
    letterSpacing: 0.25,
    textAlign: "left",
    justifyContent: 'center',
    alignItems: 'center',
    color: colors.teal,
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
    justifyContent: 'flex-end',
    borderRadius: 5,
    height: fontSize(170),
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
    fontSize: fontSize(7),
    lineHeight: fontSize(10),
    letterSpacing: 0.25,
    textAlign: "center",
    justifyContent: 'center',
    color: colors.dcItemizationColor
}

export const SUBMIT = {
    width: '100%',
    height: fontSize(45),
}