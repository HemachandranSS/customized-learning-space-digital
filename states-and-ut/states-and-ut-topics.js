const topics = [
    {
        "name": "01-State by State - Andhra Pradesh",
        "pdf": "states/01-State by State - Andhra Pradesh.pdf",
        "spotify_link": "https://open.spotify.com/episode/37ruw5dmEXQdSYi2qud7Hi?si=X1wD6FMwQGe9Ms7tVdwUCw"
    },
    {
        "name": "02-State by State - Arunachal Pradesh",
        "pdf": "states/02-State by State - Arunachal Pradesh.pdf",
        "spotify_link": "https://open.spotify.com/episode/344vEFEJKfvrVPaXhnWqW9?si=gUqSfQxvTvCBVvg0tJqRZg"
    },
    {
        "name": "03-State by State - Assam",
        "pdf": "states/03-State by State - Assam.pdf",
        "spotify_link": "https://open.spotify.com/episode/4uHBV97ZsiyXsdC5m5DURC?si=18t2z0NNTZSO0QkXjlf9Qg"
    },
    {
        "name": "04-State by State - Bihar",
        "pdf": "states/04-State by State - Bihar.pdf",
        "spotify_link": "https://open.spotify.com/episode/0P41kIhjLFbCMw4jyYkENO?si=LBAPwKTuRyOGaBdfmyrtDg"
    },
    {
        "name": "05-State by State - Chhattisgarh",
        "pdf": "states/05-State by State - Chhattisgarh.pdf",
        "spotify_link": "https://open.spotify.com/episode/2z9S8aOQdrfCae9DupVyyS?si=mO3JFwpMTUOS4MrpPqEAYA"
    },
    {
        "name": "06-State by State - Goa",
        "pdf": "states/06-State by State - Goa.pdf",
        "spotify_link": "https://open.spotify.com/episode/7rbr4KwLZjTzqoZcKyl5ar?si=mNB48EayTzerVoP0jOqaiw"
    },
    {
        "name": "07-State by State - Gujarat",
        "pdf": "states/07-State by State - Gujarat.pdf",
        "spotify_link": "https://open.spotify.com/episode/1DjWUC8askDDulu3l4pNeF?si=e1FTf8cHSVGeVV6cTfm_mQ"
    },
    {
        "name": "08-State by State - Haryana & Chandigarh",
        "pdf": "states/08-State by State - Haryana & Chandigarh.pdf",
        "spotify_link": "https://open.spotify.com/episode/5GngunlTI1Q1GRTGtuTI2a?si=_AHrcro7RkaVfM5-MxuZMA"
    },
    {
        "name": "09-State by State - Himachal Pradesh",
        "pdf": "states/09-State by State - Himachal Pradesh.pdf",
        "spotify_link": "https://open.spotify.com/episode/7ns9v6Svdth9vKa4d5kkTQ?si=HlbuF4L_TEi7vhXpnscNUQ"
    },
    {
        "name": "10-State by State - Jharkhand",
        "pdf": "states/10-State by State - Jharkhand.pdf",
        "spotify_link": "https://open.spotify.com/episode/4b0zQobzGl6ag9w0y8alzo?si=Z8mle082SYO4_y81rSRw-Q"
    },
    {
        "name": "11-State by State - Karnataka",
        "pdf": "states/11-State by State - Karnataka.pdf",
        "spotify_link": "https://open.spotify.com/episode/57i7srH5R96NzIILnP3QO2?si=4G97OeTqSoW7Ehti0YrE0g"
    },
    {
        "name": "12-State by State - Kerala",
        "pdf": "states/12-State by State - Kerala.pdf",
        "spotify_link": "https://open.spotify.com/episode/1t4ZUmh9RkXpSbpm6jPtJl?si=8i1Ll1o1RYSFGIKR9uUt1g"
    },
    {
        "name": "13-State by State - Madhya Pradesh",
        "pdf": "states/13-State by State - Madhya Pradesh.pdf",
        "spotify_link": "https://open.spotify.com/episode/4wT3HBcwBngQtQ41997Xuq?si=q4fagfLhQSK4QmvDNtexkg"
    },
    {
        "name": "14-State by State - Maharashtra",
        "pdf": "states/14-State by State - Maharashtra.pdf",
        "spotify_link": "https://open.spotify.com/episode/0XdWnfe8XiAzNnNXPkSb6m?si=LMMWDYb9ShKAu7jgRnU-sQ"
    },
    {
        "name": "15-State by State - Manipur",
        "pdf": "states/15-State by State - Manipur.pdf",
        "spotify_link": "https://open.spotify.com/episode/3PfEcLTYWf9ymHtXSUhYZp?si=E9ifM55SSQK0W4o3I26zPA"
    },
    {
        "name": "16-State by State - Meghalaya",
        "pdf": "states/16-State by State - Meghalaya.pdf",
        "spotify_link": "https://open.spotify.com/episode/72hgk6Cl13OVDRrlbo3kPK?si=5L_OUq-QSXSu-GDN-cZUjQ"
    },
    {
        "name": "17-State by State - Mizoram",
        "pdf": "states/17-State by State - Mizoram.pdf",
        "spotify_link": "https://open.spotify.com/episode/04MbdcTOQNyx3ZcU1nUQMD?si=U8ZA5i-CSEWIXJ4olpaq-w"
    },
    {
        "name": "18-State by State - Nagaland",
        "pdf": "states/18-State by State - Nagaland.pdf",
        "spotify_link": "https://open.spotify.com/episode/3imyhvgTgzDxmS3HgCRbkT?si=Vqg3v-fMQnmGCnIAuQXLaA"
    },
    {
        "name": "19-State by State - Odisha",
        "pdf": "states/19-State by State - Odisha.pdf",
        "spotify_link": "https://open.spotify.com/episode/4gryU5T4fCUcZrzmy9J3ay?si=3yRFele5SzaLapOn2qfZpw"
    },
    {
        "name": "20-State by State - Punjab",
        "pdf": "states/20-State by State - Punjab.pdf",
        "spotify_link": "https://open.spotify.com/episode/0td4FNSSYUR0aZiHO34wH9?si=WVCWWKCRSEiZJl-8C3Dxyg"
    },
    {
        "name": "21-State by State - Rajasthan",
        "pdf": "states/21-State by State - Rajasthan.pdf",
        "spotify_link": "https://open.spotify.com/episode/3ZKoFBAPpyZooPTe4HgXsy?si=kl7yd097SWinNj7agxWcIQ"
    },
    {
        "name": "22-State by State - Sikkim",
        "pdf": "states/22-State by State - Sikkim.pdf",
        "spotify_link": "https://open.spotify.com/episode/5dDUnEcVFNeqi7wYAu7EAO?si=wq54dgkmSMue-AXIuy20qQ"
    },
    {
        "name": "23-State by State - Tamil Nadu",
        "pdf": "states/23-State by State - Tamil Nadu.pdf",
        "spotify_link": "https://open.spotify.com/episode/3R1xf7Lo4P4isqO658lmY3?si=i3co3ioWTXaT6gKh_Izepw"
    },
    {
        "name": "24-State by State - Telangana",
        "pdf": "states/24-State by State - Telangana.pdf",
        "spotify_link": "https://open.spotify.com/episode/28wyadWR0MXGSf3kOwrDmv?si=xff9I8egRL6z44140YfmwQ"
    },
    {
        "name": "25-State by State - Tripura",
        "pdf": "states/25-State by State - Tripura.pdf",
        "spotify_link": "https://open.spotify.com/episode/2kX0vcztvkMMc4T7IKR9FP?si=lwNuYkzHTpaGrF5quHel2g"
    },
    {
        "name": "26-State by State - Uttarakhand",
        "pdf": "states/26-State by State - Uttarakhand.pdf",
        "spotify_link": "https://open.spotify.com/episode/1gLHxGct04KkrHIecWq435?si=8m25WFK2Q4O3oDOQbgsbMg"
    },
    {
        "name": "27-State by State - West Bengal",
        "pdf": "states/27-State by State - West Bengal.pdf",
        "spotify_link": "https://open.spotify.com/episode/1LaIQdL3CKckc65VqfEQc0?si=kY-scvIpQYqJqXTIqlOj-A"
    },
    {
        "name": "28-Copy of 08-State by State - Haryana & Chandigarh",
        "pdf": "states/28-Copy of 08-State by State - Haryana & Chandigarh.pdf",
        "spotify_link": "https://open.spotify.com/episode/39U0mbEIPAiyhaMDxm5q6Q?si=4IOB_gX4T6GuvxLXoDs0lQ"
    },
     {
        "name": "29-State by State - Uttar Pradesh",
        "pdf": "states/29-State by State - Uttar Pradesh.pdf",
        "spotify_link": "https://open.spotify.com/episode/0wEbPf6OhHHwj32Fm3x6RS?si=Yit8oLUNTAaVqWpMFCrWog"
    },
    {
        "name": "State by State - Andaman & Nicobar Islands",
        "pdf": "UT/State by State - Andaman & Nicobar Islands.pdf",
        "spotify_link": "https://open.spotify.com/episode/5gXvggYpGiwCLkskXV4O2M?si=Kjnw3WnGQz-da8QmA0Ioyg"
    },
    {
        "name": "State by State - Delhi",
        "pdf": "UT/State by State - Delhi.pdf",
        "spotify_link": "https://open.spotify.com/episode/3M6Nh9SkZ3yfR7JTRFS171?si=Iue7d8S0TgCSy0uO4jdaXA"
    },
    {
        "name": "State by State - Jammu & Kashmir - Ladakh",
        "pdf": "UT/State by State - Jammu & Kashmir - Ladakh.pdf",
        "spotify_link": "https://open.spotify.com/episode/6mFzlHKgIHl7x2EhOacKvt?si=Fklthc9qSQiPZbLJhH1cmQ"
    },
    {
        "name": "State by State - Lakshadweep",
        "pdf": "UT/State by State - Lakshadweep.pdf",
        "spotify_link": "https://open.spotify.com/episode/2X0FRR1mgOvwtfzrGPu0hj?si=growSr3LT_aigOsLc5zJnw"
    },
    {
        "name": "State by State - Daman,Diu, Dadra & Nagar Haveli and Puducherry",
        "pdf": "UT/State by State - Daman,Diu, Dadra & Nagar Haveli and Puducherry.pdf",
        "spotify_link": "https://open.spotify.com/episode/2fxDDtgoZfXgLEkeUC6dEZ?si=EAUufXbLQsy0G7T9q4nMDw"
    }
];
