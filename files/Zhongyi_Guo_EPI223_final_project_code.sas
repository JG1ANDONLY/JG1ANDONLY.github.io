/**********************************************************************************
* Program: finalproject_code.sas
* Author: Zhongyi (James) Guo
* Date:   DEC. 10, 2023
* Purpose: Code to answer questions on the final project of EPI 223.
**********************************************************************************/

/* Data Pre-processing */
/* include non-empty columns only */
data epi223.sahdemographics;
	set epi223.sahdemographics;
	keep STUDYID2 CASECON AGE GENDER RACER EDUCATE RMARITAL;
run;

/* sort two datasets by `STUDYID2` for the purpose of merging  */
proc sort data=epi223.sahdemographics;
	by STUDYID2;
run;

proc sort data=epi223.sahriskfactor;
	by STUDYID2;
run;

/* merge two datasets by `STUDYID2` */
data combined;
	merge epi223.sahdemographics epi223.sahriskfactor;
	by STUDYID2;
run;

/* detect duplicate IDs */
proc sort data=combined nodupkey dupout=dup_IDs;
	by STUDYID2;
run;

/* The duplicate IDs are 11441, 50041, and 61412. */
/* Each duplicate ID has two identical rows. One row was removed for each ID. */

/* Confirm if duplicate rows were removed */
/* proc print data=combined; */
/* run; */


/* EDUCATE, RMARITAL, BODYMASS, CIGSTAT, PACKYRS, ALCEVER, HEAVDRIN, and FAMSAH 
all have missing values recorded as -1 */
/* replace -1 with . */
/* create a binary variable EVERSMOKER (1 = former and current smokers, 0 = never smoked) */
data combined;
	set combined;
	array vars {8} EDUCATE RMARITAL BODYMASS CIGSTAT PACKYRS ALCEVER HEAVDRIN FAMSAH;
    do index=1 to 8;
    	if vars{index} = -1 then vars{index} = .;
    end;
	/* create EVERSMOKER */
    if cigstat in (2,3) then EVERSMOKER = 1;
    else if cigstat=. then EVERSMOKER = .;
    else EVERSMOKER = 0;
    drop index;
run;

/* check the new variable `EVERSMOKER` vs `cigstat` */
proc freq data=combined;
	tables EVERSMOKER*cigstat/list missing;
run;
/* successfully created */


/* categorical and continuous variable separation */
data cat_var;
	set combined;
	drop STUDYID2 AGE EDUCATE BODYMASS PACKYRS;
run;

data cont_var;
	set combined;
	keep AGE EDUCATE BODYMASS PACKYRS;
run;

/* confirm missing values were expressed as . for all categorical variables */
proc freq data=cat_var;
	tables _all_ /list missing; 
run;
/* confirmation completed */

/* confirm missing values were expressed as . for all continuous variables */
proc univariate data=cont_var;
	var _all_;
run;
/* confirmation completed */

/* Q1&2 */
/* Table Establishment */

/* format age group according to Table 1 */
proc format;
	value agegroup
    	18 - 45 = '18 – 44'
        45 - 55 = '45 – 54'
        55 - 65 = '55 – 64'
        65 - 75 = '65 – 74'
        75 - high = '≥ 75';
    value gendergroup
    	1 = 'Male'
    	2 = 'Female';
    value casecongroup
    	1 = 'Case'
    	0 = 'Control';
    value racergroup
    	1 = 'White'
    	2 = 'Black'
    	3 = 'Other';
    value cigstatgroup
    	1 = 'Never smoked'
    	2 = 'Former smoker'
    	3 = 'Current smoker';
    value alcevergroup
    	1 = 'No'
    	2 = 'Yes';
	/* create a format for `packyrstert` to be created */
    value packyrstertgroup
    	0 = '0 pk-yrs'
    	1 = '0.025 - 16 pk-yrs'
    	2 = '16.5 - 185.5 pk-yrs';
    value eversmokergroup
    	0 = 'Never smoked'
    	1 = 'Ever smoked';
run;

/* sort `combined` by CASECON to display 'Case' first */
proc sort data=combined;
	by descending casecon age;
run;

/* no missing values for `age` */
/* create the 2x2 table for age and casecon & assign formats created to the corresponding variables*/
proc freq data=combined order=data;
    tables age*casecon / chisq nocum norow nopercent;
    format casecon casecongroup. age agegroup.;
run;

/* obtain mean and SD for each group in `casecon` by `age` and p-value using t test */
proc ttest data=combined order=data;
    class casecon;
    var age;
    format casecon casecongroup.;
run;

/* create the 2x2 table for gender and casecon & assign formats created to the corresponding variables*/
proc freq data=combined order=data;
    tables gender*casecon / chisq nocum norow nopercent;
    format gender gendergroup. casecon casecongroup.;
run;

/* sort the data by `racer` */
proc sort data=combined;
	by racer;
run;

/* create the 2x2 table for racer and casecon & assign formats created to the corresponding variables*/
proc freq data=combined order=data;
    tables racer*casecon / chisq nocum norow nopercent;
    format racer racergroup. casecon casecongroup.;
run;

/* obtain mean and SD for each group in `casecon` by `educate` and p-value using t test */
proc ttest data=combined order=data;
	where educate^=.;
	class casecon;
	var educate;
	format casecon casecongroup.;
run;


/* Q2 */
/* sort the data first to display `cigstat` in an assending order */
proc sort data=combined;
	by descending casecon cigstat;
run;

/* create a 2x2 table between `eversmoker` and `casecon` */
proc freq data=combined order=data;
	where eversmoker^=.;
	tables eversmoker*casecon/ chisq nocum norow nopercent;
	format eversmoker eversmokergroup. casecon casecongroup.;
run;


/* create a 3x2 table between `cigstat` and `casecon` */
proc freq data=combined order=data;
	where cigstat^=.;
	tables cigstat*casecon/ chisq nocum norow nopercent;
	format cigstat cigstatgroup. casecon casecongroup.;
run;

/* use logistic regression to calculate odds ratio between `eversmoker` and `casecon`*/
proc logistic data=combined;
	where eversmoker^=.;
	format eversmoker eversmokergroup. casecon casecongroup.;
	class eversmoker(ref='Never smoked');
	model casecon(event='Case') = eversmoker;
	oddsratio eversmoker;
run;


/* use logistic regression to calculate odds ratio between `cigstat` and `casecon`*/
proc logistic data=combined;
	where cigstat^=.;
	format cigstat cigstatgroup. casecon casecongroup.;
	class cigstat(ref='Never smoked');
	model casecon(event='Case') = cigstat;
	oddsratio cigstat;
run;

/* use logistic regression to calculate odds ratio for `eversmoker`, adjusted for age and gender */
proc logistic data=combined;
	where eversmoker^=.;
	format eversmoker eversmokergroup. casecon casecongroup. gender gendergroup.;
	class eversmoker(ref='Never smoked');
	model casecon(event='Case') = eversmoker age gender;
	oddsratio eversmoker;
run;

/* use logistic regression to calculate odds ratio for `cigstat`, adjusted for age and gender */
proc logistic data=combined;
	where cigstat^=.;
	format cigstat cigstatgroup. casecon casecongroup. gender gendergroup.;
	class cigstat(ref='Never smoked');
	model casecon(event='Case') = cigstat age gender;
	oddsratio cigstat;
run;

/* create a tertile variable for `PACKYRS` */
proc rank data=combined out=combined groups=3;
	where PACKYRS^=.;
	var PACKYRS;
	ranks PACKYRSTERT;
run;

/* check the new variable PACKYRSTERT */
proc freq data=combined;
	tables PACKYRSTERT*PACKYRS/list missing;
run;

/* From the frequency table, we can observe that: */
/* first tertile: 0 pk-yrs */
/* second tertle: 0.025 - 16 pk-yrs */
/* third tertle: 16.5 - 185.5 pk-yrs */

/* create a 3x2 table for `packyrstert` and `casecon` */
proc freq data=combined order=data;
	where packyrstert^=.;
	tables packyrstert*casecon/ chisq nocum norow nopercent;
	format packyrstert packyrstertgroup. casecon casecongroup.;
run;

/* use logistic regression to calculate odds ratio for packyrstert*/
proc logistic data=combined;
	where packyrstert^=.;
	format packyrstert packyrstertgroup. casecon casecongroup.;
	class packyrstert(ref='0 pk-yrs');
	model casecon(event='Case') = packyrstert;
	oddsratio packyrstert;
run;

/* use logistic regression to calculate odds ratio for packyrstert, adjusted for age and gender*/
proc logistic data=combined;
	format packyrstert packyrstertgroup. casecon casecongroup. age agegroup. gender gendergroup.;
	class packyrstert(ref='0 pk-yrs');
	model casecon(event='Case') = packyrstert age gender;
	oddsratio packyrstert;
run;

/* Q3 */
/* generate a box plot for BMI by case-control status */
proc sgplot data=combined;
	where BODYMASS^=.;
	format casecon casecongroup.;
	vbox BODYMASS / category=casecon;
	title "Boxplot of BODYMASS by Case-Control Status";
run;

/* perform a t test to compare means of BODYMASS between Cases and Controls */
proc ttest data=combined order=data;
	format casecon casecongroup.;
	class casecon;
	var bodymass;
run;

/* Q4 */
/* sort the data first by alcever */
proc sort data=combined;
	by alcever;
run;

/* obtain odds ratio for `eversmoker` stratified by `ALCEVER` */
proc freq data=combined;
	where eversmoker^=. and ALCEVER^=.;
    tables eversmoker*casecon / chisq nocum norow nopercent relrisk;
    by ALCEVER;
    format eversmoker eversmokergroup. casecon casecongroup. alcever alcevergroup.;
run;

/* obtain MH odds ratio for `eversmoker` stratified by `ALCEVER` */
proc freq data=combined;
	where eversmoker^=. and ALCEVER^=.;
    tables eversmoker*casecon / chisq nocum cmh norow nopercent;
    by ALCEVER;
    format eversmoker eversmokergroup. casecon casecongroup. alcever alcevergroup.;
run;

