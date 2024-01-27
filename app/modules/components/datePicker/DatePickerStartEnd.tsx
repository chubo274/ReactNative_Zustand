import { AppButton } from 'components/button/AppButton';
import { InputHourMinute } from 'components/input/AppInputHourMinute';
import { AppModal } from 'components/modalize/AppModal';
import { AppText } from 'components/text/AppText';
import moment, { Moment } from 'moment';
import { CaretLeft, CaretRight } from 'phosphor-react-native';
import { default as React, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, StyleProp, StyleSheet, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { MarkingProps } from 'react-native-calendars/src/calendar/day/marking';
import { MarkedDates } from 'react-native-calendars/src/types';
import { Modalize } from 'react-native-modalize';
import { IHandles } from 'react-native-modalize/lib/options';
import { DateTimeFormat, StoreKey } from 'shared/helpers/constant';
import { datePickerLocales, formatDateLocales } from 'shared/helpers/datePicker';
import { getLocal, parseDateTime } from 'shared/helpers/function';
import { LANGUAGES } from 'shared/localization';
import { ITheme, useAppTheme } from 'shared/theme';
const widthScreen = Dimensions.get('window').width


interface IProps {
    onOpen?: () => void,
    onDateSelected?: (date: any) => void,
    dateSelected?: Moment | string; // YYYY-MM-DD
    dateStart?: Moment | string; // YYYY-MM-DD  just use once of dateStart or dateEnd
    dateEnd?: Moment | string; // YYYY-MM-DD    just use once of dateStart or dateEnd
    minDate?: Moment | string; // YYYY-MM-DD
    maxDate?: Moment | string // YYYY-MM-DD
    hour?: number
    minute?: number
    chooseHourMinute?: boolean
    titleModal?: string
    hideViewHolder?: boolean
    titleInputHourMinute?: string
    requireFieldInputHourMinute?: boolean
    textTimeStyle?: StyleProp<TextStyle>
    textAppButton?: string
    buttonStyleSubmitModal?: StyleProp<ViewStyle>
    textButton?: StyleProp<TextStyle>
    hasBottomButton?: boolean
    bottomButtonName?: string
    onPressBtn?: (currentFullDate: string) => void
    buttonStyleSubmitBottomModal?: StyleProp<ViewStyle>
    textButtonBottom?: StyleProp<TextStyle>
    titleHeaderStyle?: StyleProp<TextStyle>
    enableBtnPicker?: boolean

}

// ref is required field

const DatePickerStartEnd = React.memo(React.forwardRef((props: IProps, ref: React.ForwardedRef<IHandles | null>) => {
    // !State
    const { onOpen, onDateSelected, dateStart, dateEnd, hour, minute, dateSelected, minDate, maxDate, chooseHourMinute, titleModal, hideViewHolder, titleInputHourMinute, requireFieldInputHourMinute, textTimeStyle, textAppButton, buttonStyleSubmitModal, textButton, hasBottomButton, bottomButtonName, onPressBtn, buttonStyleSubmitBottomModal, textButtonBottom, titleHeaderStyle, enableBtnPicker } = props
    const modalizeMonthYearRef = useRef<Modalize>();
    const theme = useAppTheme();
    const styles = useStyles(theme);
    const { t } = useTranslation()
    const [valueLanguage, setValueLanguage] = useState<LANGUAGES>()

    useEffect(() => {
        getLocal(StoreKey.Localization).then((value: LANGUAGES) => {
            setValueLanguage(value ?? LANGUAGES.VIETNAM);
        });
    }, [])

    LocaleConfig.locales['en'] = datePickerLocales['en'];
    LocaleConfig.locales['vi'] = datePickerLocales['vi'];
    LocaleConfig.defaultLocale = valueLanguage?.toString();

    const _min = useMemo(() => parseDateTime((dateStart || minDate)), [dateStart, minDate]);
    const _max = useMemo(() => parseDateTime((dateEnd || maxDate)), [dateEnd, maxDate]);

    const defaultDate = useMemo(() => { // parse to default format of moment
        return moment(dateSelected ?? null).isValid()
            ? moment(dateSelected).format(DateTimeFormat.APIFormat).toString()
            : undefined
    }, [dateSelected]);

    const [currentMonthShow, setCurrentMonthShow] = useState(defaultDate);  // only check month current, validate min, max
    const [currentFullDate, setCurrentFullDate] = useState(defaultDate);
    const [currentTime, setCurrentTime] = useState(moment(defaultDate).set({ hour: hour, minute: minute }));
    
    useEffect(() => {
        setCurrentMonthShow((prev) => {
            if (moment(_min).isSame(moment(prev))) return prev
            return _min
        })
    }, [_min])

    useEffect(() => {
        setCurrentFullDate((prev) => {
            if (moment(prev).isSame(moment(defaultDate))) return prev
            return defaultDate
        })
    }, [defaultDate])

    useEffect(() => {
        setCurrentTime((prev) => {
            if (moment(prev).startOf('day').isSame(moment(currentFullDate).startOf('day'))) return prev
            return moment(currentFullDate).set({ hour: moment(prev).get('hour'), minute: moment(prev).get('minute') })
        })
        setCurrentMonthShow((prev) => {
            if (moment(prev).startOf('month').isSame(moment(currentFullDate).startOf('month'))) return prev
            return currentFullDate
        })
    }, [currentFullDate])

    const formatYear = useMemo(() => moment(currentMonthShow).format(DateTimeFormat.Year), [currentMonthShow])
    const currentMonthIndex = useMemo(() => moment(currentMonthShow).get('month'), [currentMonthShow])

    const dataMonth = useMemo(() => [
        { id: '1', month: t('January') },
        { id: '2', month: t('February') },
        { id: '3', month: t('March') },
        { id: '4', month: t('April') },
        { id: '5', month: t('May') },
        { id: '6', month: t('June') },
        { id: '7', month: t('July') },
        { id: '8', month: t('August') },
        { id: '9', month: t('September') },
        { id: '10', month: t('October') },
        { id: '11', month: t('November') },
        { id: '12', month: t('December') }
    ], [t])

    // !Function
    const onChangeTime = useCallback((day?: string, hourSelect?: number, minuteSelect?: number) => {
        const _day = day ?? defaultDate
        const _hour = hourSelect ?? hour ?? 0
        const _minute = minuteSelect ?? minute ?? 0
        // TODO fix for hour case, separate current (for month and year) and currentFullDate (for dateTime String)
        setCurrentFullDate(_day)
        setCurrentTime(moment(_day).set({ hour: _hour, minute: _minute }))
    }, [defaultDate, hour, minute])

    const handleSubtractMonth = useCallback(() => {
        const nextMonth = moment(currentMonthShow).subtract(1, 'month').format(DateTimeFormat.FullYearDash)
        setCurrentMonthShow(nextMonth)
    }, [currentMonthShow])

    const handleAddMonth = useCallback(() => {
        const nextMonth = moment(currentMonthShow).add(1, 'month').format(DateTimeFormat.FullYearDash)
        setCurrentMonthShow(nextMonth)
    }, [currentMonthShow])

    const marked = useMemo((): MarkedDates => {
        const selectedDate = currentFullDate ? moment(currentFullDate)?.startOf('day') : undefined
        const today = moment().format('YYYY-MM-DD');

        const styleSelect = (type?: 'left' | 'right' | 'center'): MarkingProps => {
            let defaultContainer
            switch (type) {
                case 'left':
                    defaultContainer = {
                        borderTopLeftRadius: 8,
                        borderBottomLeftRadius: 8,
                        borderTopRightRadius: 0,
                        borderBottomRightRadius: 0,
                        paddingRight: 0,
                        width: 56 * widthScreen / 375,
                    }
                    break;
                case 'right':
                    defaultContainer = {
                        borderTopLeftRadius: 0,
                        borderBottomLeftRadius: 0,
                        borderTopRightRadius: 8,
                        borderBottomRightRadius: 8,
                        paddingLeft: 0,
                        width: 56 * widthScreen / 375,
                    }
                    break;
                case 'center':
                    defaultContainer = {
                        borderRadius: 0,
                        width: 80 * widthScreen / 375,
                    }
                    break;
                default:
                    defaultContainer = {
                        borderRadius: 8,
                        width: 36 * widthScreen / 375,
                    }
                    break;
            }

            return {
                selected: true, selectedColor: theme.color.brand.primary, selectedTextColor: theme.color.brand.white,
                customStyles: {
                    container: {
                        backgroundColor: theme.color.brand.light,
                        elevation: theme.dimensions.p4,
                        ...defaultContainer
                    },
                    text: {
                        fontSize: theme.fontSize.p15,
                        color: theme.color.brand.primary,
                        fontWeight: 'bold',
                    }
                },
            }
        }

        // logic setup config selected
        const defaultConfig: MarkedDates = {
            [today]: {
                selected: true,
                customStyles: {
                    container: {
                        backgroundColor: theme.color.bg.white,
                        width: 36,
                    },
                    text: {
                        fontSize: theme.fontSize.p15,
                        color: theme.color.brand.secondary,
                        fontWeight: 'bold',
                    }
                }
            },
        }

        // init list last week enable of prev month & first week enable of next month
        // const startLastMonthNeedCheck = moment(currentMonthShow).subtract(1, 'month').endOf('month').subtract(5, 'day').format(DateTimeFormat.FullYearDash)
        // const endLastMonthNeedCheck = moment(currentMonthShow).add(1, 'month').startOf('month').add(5, 'day').format(DateTimeFormat.FullYearDash)
        // let indexDay = moment(startLastMonthNeedCheck)
        // const lastIndex = moment(endLastMonthNeedCheck)
        // while (moment(indexDay).isBefore(lastIndex)) {
        //     const isNotInThisMonth = moment(indexDay).get('month') != moment(currentMonthShow).get('month')
        //     const isAfterMin = _min ? moment(indexDay).isAfter(_min) : true
        //     const isBeforeMax = _max ? moment(indexDay).isBefore(_max) : true
        //     if (isNotInThisMonth && isAfterMin && isBeforeMax) {
        //         defaultConfig[moment(indexDay).format(DateTimeFormat.FullYearDash)] = {
        //             selected: false,
        //             customStyles: {
        //                 container: {
        //                     backgroundColor: theme.color.bg.white,
        //                     width: 36,
        //                 },
        //                 text: {
        //                     fontSize: theme.fontSize.p15,
        //                     color: theme.color.textColor.secondary,
        //                 }
        //             }
        //         }
        //     }
        //     indexDay = moment(indexDay).add(1, 'day')
        // }


        // dateStart || dateEnd style default - no has selectedDate
        const hasStartorEnd = Boolean(dateStart || dateEnd) ? moment(dateStart || dateEnd).startOf('day').format(DateTimeFormat.FullYearDash) : undefined;
        if (hasStartorEnd) defaultConfig[hasStartorEnd] = styleSelect()
        if (selectedDate) {
            defaultConfig[moment(selectedDate).format(DateTimeFormat.FullYearDash)] = styleSelect()
            if (hasStartorEnd) {
                const selectedDateBeforeStartorEnd = moment(selectedDate).startOf('day').isBefore(moment(hasStartorEnd)?.startOf('day'))
                const selectedDateSameStartorEnd = moment(selectedDate).startOf('day').isSame(moment(hasStartorEnd)?.startOf('day'))
                const selectedDateAfterStartorEnd = moment(selectedDate).startOf('day').isAfter(moment(hasStartorEnd)?.startOf('day'))

                if (selectedDateBeforeStartorEnd) {
                    defaultConfig[hasStartorEnd] = styleSelect('right')
                    defaultConfig[moment(selectedDate).format(DateTimeFormat.FullYearDash)] = styleSelect('left')
                    // day between range dateStart || dateEnd and selectedDate
                    let indexDay = moment(hasStartorEnd)
                    const lastIndex = moment(selectedDate).add(1, 'day')
                    while (moment(indexDay).isAfter(lastIndex)) {
                        indexDay = moment(indexDay).subtract(1, 'day')
                        defaultConfig[moment(indexDay).format(DateTimeFormat.FullYearDash)] = styleSelect('center')
                    }
                }

                if (selectedDateSameStartorEnd) defaultConfig[hasStartorEnd] = styleSelect()

                if (selectedDateAfterStartorEnd) {
                    defaultConfig[hasStartorEnd] = styleSelect('left')
                    defaultConfig[moment(selectedDate).format(DateTimeFormat.FullYearDash)] = styleSelect('right')
                    // day between range dateStart || dateEnd and selectedDate
                    let indexDay = moment(hasStartorEnd)
                    const lastIndex = moment(selectedDate).subtract(1, 'day')
                    while (moment(indexDay).isBefore(lastIndex)) {
                        indexDay = moment(indexDay).add(1, 'day')
                        defaultConfig[moment(indexDay).format(DateTimeFormat.FullYearDash)] = styleSelect('center')
                    }
                }
            }
        }


        return defaultConfig
    }, [dateStart, dateEnd, theme, currentFullDate]);

    const showDatePicker = () => {
        modalizeMonthYearRef.current?.open()
    };

    const onNextYear = useCallback(() => {
        // TODO this to check max months when change year
        let monthCurrent = moment(currentMonthShow)
        if (
            monthCurrent.get('years') + 1 === moment(_max).get('years') &&
            monthCurrent.get('months') > moment(_max).get('months')
        ) {
            monthCurrent = moment(currentMonthShow).set('months', moment(_max).get('months'))
        }
        // END TODO
        setCurrentMonthShow(moment(monthCurrent).add(1, 'year').format(DateTimeFormat.APIFormat))
    }, [currentMonthShow, _max])

    const onPreviousYear = useCallback(() => {
        // TODO this to check max months when change year
        let monthCurrent = moment(currentMonthShow)
        if (
            monthCurrent.get('years') - 1 === moment(_min).get('years') &&
            monthCurrent.get('months') < moment(_min).get('months')
        ) {
            monthCurrent = moment(currentMonthShow).set('months', moment(_min).get('months'))
        }
        // END TODO
        setCurrentMonthShow(moment(monthCurrent).subtract(1, 'year').format(DateTimeFormat.APIFormat))
    }, [currentMonthShow, _min])

    const onPickMonth = useCallback((monthIndex: number) => {
        const newCurrent = moment(currentMonthShow).set('month', monthIndex).format(DateTimeFormat.FullYearDash)
        setCurrentMonthShow(newCurrent)
        modalizeMonthYearRef.current?.close()
    }, [currentMonthShow, modalizeMonthYearRef, setCurrentMonthShow])

    const onSetDate = useCallback((hour: number, minute: number) => {
        const date = moment(currentFullDate).set({ hour, minute }).format(DateTimeFormat.APIFormat);
        onDateSelected?.(date)
    }, [currentFullDate, onDateSelected])

    const disableYear = useCallback((type: string) => {
        if (type === 'prev') {
            if (!moment(_min ?? null)?.isValid()) return false
            return moment(currentMonthShow).get('years') === moment(_min).get('years')
        }
        if (!moment(_max ?? null)?.isValid()) return false
        return moment(currentMonthShow).get('years') === moment(_max).get('years')

    }, [currentMonthShow, _max, _min])

    const disableMonthItem = useCallback((month: number) => {
        let checkDisable = false
        if (!moment(_min ?? null)?.isValid()) {
            checkDisable = false
        } else if (moment(currentMonthShow).get('years') === moment(_min).get('years') && month < (moment(_min).get('months') + 1)) {
            checkDisable = true
            return checkDisable
        }

        if (!moment(_max ?? null)?.isValid()) {
            checkDisable = false
        } else if (moment(currentMonthShow).get('years') === moment(_max).get('years') && month > (moment(_max).get('months') + 1)) {
            checkDisable = true
            return checkDisable
        }
        return checkDisable
    }, [currentMonthShow, _max, _min])

    const disableMonth = useCallback((type: string) => {
        if (type === 'prev') {
            if (!moment(_min ?? null)?.isValid()) return false
            return moment(currentMonthShow).get('years') === moment(_min).get('years') && moment(currentMonthShow).get('months') <= moment(_min).get('months')
        }
        if (!moment(_max ?? null)?.isValid()) return false
        return moment(currentMonthShow).get('years') === moment(_max).get('years') && moment(currentMonthShow).get('months') >= moment(_max).get('months')
    }, [currentMonthShow, _max, _min])

    // !Render
    const renderViewMonthPicker = useMemo(() => {
        return (
            <View style={{ paddingBottom: theme.dimensions.p24 }}>
                <View style={styles.headerYearModal}>
                    <AppText style={styles.textYearStyle}>{`${t('year')} ${formatYear}`}</AppText>
                    <View style={styles.iconWrapper}>
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={onPreviousYear}
                            disabled={disableYear('prev')}
                        >
                            <CaretLeft
                                size={theme.dimensions.p16}
                                weight="bold"
                                color={disableYear('prev') ? theme.color.textColor.disable : theme.color.brand.primary}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity activeOpacity={0.8} onPress={onNextYear} disabled={disableYear('next')}>
                            <CaretRight
                                size={theme.dimensions.p16}
                                weight="bold"
                                color={disableYear('next') ? theme.color.textColor.disable : theme.color.brand.primary}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.monthWrapper}>
                    {dataMonth.map((el, index) => {
                        return <TouchableOpacity
                            key={el.id}
                            activeOpacity={0.8}
                            style={[styles.itemMonth, {
                                backgroundColor: currentMonthIndex === index ? theme.color.brand.light : 'transparent'
                            }
                            ]}

                            onPress={() => onPickMonth(index)}
                            disabled={disableMonthItem(parseInt(el.id))}
                        >
                            <AppText style={[styles.textMonth, { color: disableMonthItem(parseInt(el.id)) ? theme.color.textColor.disable : (currentMonthIndex === index ? theme.color.brand.primary : theme.color.textColor.primary), fontFamily: currentMonthIndex === index ? theme.font.Medium : theme.font.Regular }]}>
                                {el.month}
                            </AppText>
                        </TouchableOpacity>
                    })}
                </View>
            </View>
        )
    }, [theme.dimensions.p24, theme.dimensions.p16, theme.color.textColor.disable, theme.color.textColor.primary, theme.color.brand.primary, theme.color.brand.light, theme.font.Medium, theme.font.Regular, styles.headerYearModal, styles.textYearStyle, styles.iconWrapper, styles.monthWrapper, styles.itemMonth, styles.textMonth, t, formatYear, onPreviousYear, disableYear, onNextYear, dataMonth, currentMonthIndex, disableMonthItem, onPickMonth])

    return (
        <>
            <AppModal
                adjustToContentHeight
                hideViewHolder={hideViewHolder}
                refModal={ref}
                onOpen={() => {
                    onChangeTime()
                    onOpen?.()
                }}
                childrenStyle={styles.childrenModal}
                titleHeader={titleModal}
                titleHeaderStyle={titleHeaderStyle}
            >
                <Calendar
                    key={currentMonthShow}
                    current={moment(currentMonthShow).format(DateTimeFormat.FullYearDash)}
                    firstDay={1}
                    markingType={'custom'}
                    markedDates={marked}
                    onDayPress={(day) => {
                        const _day = moment(day.dateString).set({
                            hours: moment(currentTime).get('hour'),
                            minutes: moment(currentTime).get('minute')
                        })

                        const minForSelected = dateStart && moment(_day).isBefore(moment(dateStart))
                        const maxForSelected = dateEnd && moment(_day).isAfter(moment(dateEnd))
                        if (minForSelected || maxForSelected) return

                        if (Boolean(!onPressBtn) && !chooseHourMinute) {
                            // @ts-ignore
                            ref?.current?.close()
                            onDateSelected?.(_day?.toString())
                        }
                        onChangeTime(_day?.toString(), moment(currentTime).get('hour'), moment(currentTime).get('minute'))
                    }}
                    monthFormat={DateTimeFormat.MonthYear}
                    minDate={parseDateTime(_min, undefined, DateTimeFormat.FullYearDash)}
                    maxDate={parseDateTime(_max, undefined, DateTimeFormat.FullYearDash)}
                    hideArrows={true}
                    onPressArrowLeft={subtractMonth => subtractMonth()}
                    onPressArrowRight={addMonth => addMonth()}
                    renderHeader={() =>
                        <View style={styles.customHeaderTitleContainer} >
                            <TouchableOpacity onPress={showDatePicker} style={styles.filterContainer} >
                                <AppText style={styles.textFilter}>{valueLanguage ? formatDateLocales(currentMonthShow, valueLanguage) : ''}</AppText>
                                <CaretRight size={theme.dimensions.makeResponsiveSize(16)} weight="bold" color={theme.color.brand.primary} />
                            </TouchableOpacity>
                            <View style={styles.customHeaderTitleCaretIcon} >
                                <TouchableOpacity
                                    disabled={disableMonth('prev')}
                                    activeOpacity={0.8}
                                    onPress={handleSubtractMonth} >
                                    <CaretLeft
                                        size={theme.dimensions.makeResponsiveSize(16)}
                                        weight="bold"
                                        color={disableMonth('prev') ? theme.color.textColor.disable : theme.color.brand.primary}
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    disabled={disableMonth('next')}
                                    activeOpacity={0.8}
                                    onPress={handleAddMonth}>
                                    <CaretRight
                                        size={theme.dimensions.makeResponsiveSize(16)}
                                        weight="bold"
                                        color={disableMonth('next') ? theme.color.textColor.disable : theme.color.brand.primary}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                    }
                />

                {chooseHourMinute ?
                    <View style={{ marginHorizontal: theme.dimensions.p16 }}>
                        <InputHourMinute
                            disabled={enableBtnPicker ? !enableBtnPicker : Boolean(!currentFullDate)}
                            title={titleInputHourMinute ? titleInputHourMinute : t('time')}
                            requireField={requireFieldInputHourMinute ? false : true}
                            timeSelected={moment(currentTime)}
                            onChangeTime={(hour, minute) => {
                                // TODO fix for hour case, separate current (for month and year) and currentFullDate (for dateTime String)
                                onChangeTime(currentFullDate, hour, minute)
                            }}
                            maxHour={_max}
                            minHour={_min}
                            textTimeStyle={textTimeStyle}
                        />
                        <AppButton
                            disabled={enableBtnPicker ? !enableBtnPicker : Boolean(!currentFullDate)}
                            text={textAppButton ? textAppButton : t('done')}
                            style={[buttonStyleSubmitModal ? buttonStyleSubmitModal : styles.buttonStyleSubmitModal]}
                            textStyle={[textButton ? textButton : styles.textButton]}
                            onPress={() => {
                                onSetDate(moment(currentTime).get('hour'), moment(currentTime).get('minute'))
                                // @ts-ignore
                                ref.current?.close()
                            }}
                        />
                    </View>
                    : null}

                <View style={{ flex: 1, width: '100%', paddingHorizontal: theme.dimensions.p16, }}>
                    {hasBottomButton ?
                        <AppButton
                            disabled={!currentFullDate}
                            text={bottomButtonName ? bottomButtonName : t('done')}
                            style={[buttonStyleSubmitBottomModal ? buttonStyleSubmitBottomModal : styles.buttonStyleSubmitBottomModal]}
                            textStyle={[textButtonBottom ? textButtonBottom : styles.textButtonBottom]}
                            onPress={() => onPressBtn?.(currentFullDate || '')}
                        />
                        : null}
                </View>
            </AppModal>
            <AppModal
                // @ts-ignore
                refModal={modalizeMonthYearRef}
                adjustToContentHeight
                hideViewHolder
                childrenStyle={styles.childrenStyle}
            >
                {renderViewMonthPicker}
            </AppModal>
        </>
    )
}))
const useStyles = (theme: ITheme) => StyleSheet.create({
    filterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    childrenModal: {
        marginTop: theme.dimensions.p16,
        paddingHorizontal: 0,
        marginBottom: theme.dimensions.p8,
    },
    textFilter: {
        fontSize: theme.fontSize.p20,
        fontFamily: theme.font.Medium,
        marginRight: theme.dimensions.p8,
    },
    customHeaderTitleContainer: {
        marginBottom: theme.dimensions.p16,
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    customHeaderTitleCaretIcon: {
        flexDirection: 'row',
        width: theme.dimensions.makeResponsiveSize(48),
        justifyContent: 'space-between'
    },
    childrenStyle: {
        padding: theme.dimensions.p16,
        paddingBottom: 0,
    },
    textYearStyle: {
        fontSize: theme.fontSize.p20,
        fontFamily: theme.font.Medium,
        color: theme.color.textColor.primary
    },
    iconWrapper: {
        flexDirection: 'row',
        width: theme.dimensions.makeResponsiveSize(48),
        justifyContent: 'space-between'
    },
    headerYearModal: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    monthWrapper: {
        flexWrap: 'wrap',
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: theme.dimensions.p32
    },
    itemMonth: {
        width: '33%',
        marginBottom: theme.dimensions.p28,
        alignItems: 'center',
        paddingVertical: theme.dimensions.p8,
        borderRadius: theme.dimensions.p8
    },
    textMonth: {
        fontSize: theme.fontSize.p15,
    },
    buttonStyleSubmitModal: {
        borderRadius: 50,
        backgroundColor: theme.color.brand.primary,
        paddingHorizontal: theme.dimensions.p16,
        paddingVertical: theme.dimensions.p12,
        marginTop: 24
    },
    buttonStyleSubmitBottomModal: {
        borderRadius: 50,
        backgroundColor: theme.color.brand.primary,
        paddingHorizontal: theme.dimensions.p16,
        paddingVertical: theme.dimensions.p12,
        marginTop: 24,
    },
    textButton: {
        color: theme.color.brand.white,
        fontSize: theme.fontSize.p15,
        fontFamily: theme.font.Bold,
        lineHeight: 24
    },
    textButtonBottom: {
        color: theme.color.brand.white,
        fontSize: theme.fontSize.p15,
        fontFamily: theme.font.Bold,
        lineHeight: 24
    }
})

export default DatePickerStartEnd;

// example
// <DatePickerStartEnd
//     ref={refStart}
//     titleModal='refStart'
//     minDate={'2024-01-23 12:12'}
//     maxDate={'2024-01-31 12:12'}
//     dateEnd={dateEnd}
//     chooseHourMinute={true}
//     hour={dateStart ? moment(dateStart).get('hour') : 12}
//     minute={dateStart ? moment(dateStart).get('minute') : 12}
//     dateSelected={dateStart}
//     onDateSelected={setDateStart}
// />
// <DatePickerStartEnd
//     ref={refEnd}
//     titleModal='refEnd'
//     minDate={'2024-01-23 12:12'}
//     maxDate={'2024-01-31 12:12'}
//     dateStart={dateStart}
//     chooseHourMinute={true}
//     hour={dateEnd ? moment(dateEnd).get('hour') : 12}
//     minute={dateEnd ? moment(dateEnd).get('minute') : 12}
//     dateSelected={dateEnd}
//     onDateSelected={setDateEnd}
// />  