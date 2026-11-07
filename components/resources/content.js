// Worksheet content carried over word-for-word from the WellWheel prototype.

export const SPEND_CATS = [
 ['Housing',['Rent / Mortgage','HOA Fees','Property Taxes','Homeowners Insurance','Renters Insurance']],
 ['Utilities',['Electricity','Water','Sewer','Trash','Natural Gas','Internet','Cell Phone','Home Phone']],
 ['Transportation',['Car Payment','Auto Insurance','Gasoline','Parking','Tolls','Vehicle Maintenance','Vehicle Registration','Public Transportation']],
 ['Food',['Groceries','Restaurants','Coffee Shops','DoorDash / Uber Eats / Grubhub','Meal Delivery Services']],
 ['Streaming & Entertainment',['Netflix','Hulu','Disney+','Max','Paramount+','Peacock','Apple TV+','Amazon Prime','YouTube Premium','Spotify','Apple Music','Audible','SiriusXM','Xbox Game Pass','PlayStation Plus','Nintendo Switch Online']],
 ['Technology',['Apple iCloud','Google One','Microsoft 365','Adobe','Dropbox','Canva','ChatGPT','Antivirus','Website Hosting','Domain Name']],
 ['Credit Cards',['Credit Card #1','Credit Card #2','Credit Card #3','Credit Card #4','Credit Card #5','Credit Card #6','Credit Card #7','Credit Card #8']],
 ['Education',['Tuition','Student Loan #1','Student Loan #2','Books','Certifications']],
 ['Health',['Health Insurance','Dental Insurance','Vision Insurance','Therapy','Medications','Gym Membership','Personal Trainer','Supplements']],
 ['Pets',['Pet Food','Veterinary Care','Grooming','Pet Insurance','Pet Medications']],
 ['Family',['Childcare','Child Support','School Expenses','Allowances']],
 ['Protection',['Life Insurance','Disability Insurance','Legal Services']],
 ['Lifestyle',['Clothing','Haircuts','Hobbies','Gifts','Charitable Giving','Court & Legal Fees','Miscellaneous']],
 ['Savings & Investing',['Emergency Fund','Retirement','Investment Accounts','Vacation Fund','Holiday Fund','Home Fund','Vehicle Fund','Education Fund']]
];

export const PLAN_CATS=['Housing','Utilities','Phone & Internet','Transportation','Food','Entertainment','Shopping','Pets','Health','Other'];
export const INC_KEYS=['Primary income','Secondary income','Side business','Other income'];
export const SAVE_KEYS=['Vacation','Vehicle','Home','Christmas','Education','Other'];
export const EF_WAYS=['Save a set amount from every paycheck','Save part of overtime, bonuses, refunds, or side income','Use a no-spend day or weekend','Sell items I no longer use','Reduce one expense and move the difference into savings','Round up purchases and save the difference','Make a temporary extra payment to savings before increasing lifestyle spending'];
export const ASSETS=['Checking account','Savings account','Retirement accounts','Investments','Home equity','Vehicle value','Cash','Other'];
export const LIABS=['Credit cards','Student loans','Auto loans','Mortgage','Personal loans','Medical debt','Other'];

export const BOOKS=[['I Will Teach You to Be Rich','Ramit Sethi'],['The Millionaire Next Door','Thomas J. Stanley & William D. Danko'],['The Psychology of Money','Morgan Housel'],['Atomic Habits','James Clear'],['Make Money Easy','Lewis Howes'],['Main Street Millionaire','Codie Sanchez'],['Rich Dad Poor Dad','Robert T. Kiyosaki'],['Cashflow Quadrant','Robert T. Kiyosaki'],['The Total Money Makeover','Dave Ramsey'],['Baby Steps Millionaires','Dave Ramsey'],['The Simple Path to Wealth','JL Collins'],['The Automatic Millionaire','David Bach'],['The Richest Man in Babylon','George S. Clason'],['Your Money or Your Life','Vicki Robin & Joe Dominguez'],['The Intelligent Investor','Benjamin Graham'],['The Little Book of Common Sense Investing','John C. Bogle'],['The Bogleheads’ Guide to Investing','Taylor Larimore, Mel Lindauer & Michael LeBoeuf'],['The Coffeehouse Investor','Bill Schultheis'],['The Almanack of Naval Ravikant','Eric Jorgenson'],['Die With Zero','Bill Perkins'],['Think and Grow Rich','Napoleon Hill'],['The One Thing','Gary Keller & Jay Papasan'],['Essentialism','Greg McKeown'],['Deep Work','Cal Newport'],['The Charge','Brendon Burchard'],['High Performance Habits','Brendon Burchard'],['The Millionaire Fastlane','MJ DeMarco'],['Unscripted','MJ DeMarco'],['The $100 Startup','Chris Guillebeau'],['Profit First','Mike Michalowicz'],['The E-Myth Revisited','Michael E. Gerber'],['Built to Sell','John Warrillow'],['The Lean Startup','Eric Ries'],['Start with Why','Simon Sinek'],['Good to Great','Jim Collins'],['The 7 Habits of Highly Effective People','Stephen R. Covey'],['The Compound Effect','Darren Hardy'],['The Wealthy Gardener','John Soforic'],['The Wealthy Barber Returns','David Chilton'],['The Path to Wealth','Brian Tracy']];

// Coping skills library. Each skill: [name, how to do it, time] time: q = under 2 min, s = 5–15 min, l = longer
export const COPING_CATS = [
 {id:'calm', name:'Breathe & calm your body', pillar:'physical'},
 {id:'ground', name:'Grounding & senses', pillar:'mental'},
 {id:'move', name:'Move your body', pillar:'physical'},
 {id:'think', name:'Thinking skills', pillar:'mental'},
 {id:'feel', name:'Feel & express', pillar:'emotional'},
 {id:'connect', name:'Connect with others', pillar:'relationships'},
 {id:'care', name:'Comfort & self-care', pillar:'emotional'},
 {id:'distract', name:'Distract & reset', pillar:'mental'},
 {id:'create', name:'Create something', pillar:'intellectual'},
 {id:'spirit', name:'Faith & spirit', pillar:'spiritual'},
 {id:'nature', name:'Nature & outdoors', pillar:'environmental'},
 {id:'organize', name:'Get organized', pillar:'purpose'},
 {id:'go', name:'On the go (work, car, public)', pillar:'mental'}
];
export const COPING = {
 calm:[
  ['Box breathing','Breathe in for 4, hold for 4, out for 4, hold for 4. Repeat four rounds.','q'],
  ['4-7-8 breathing','Breathe in for 4, hold for 7, breathe out slowly for 8. Repeat three times.','q'],
  ['Longer exhale','Make every breath out twice as long as the breath in. It tells your body it’s safe.','q'],
  ['Belly breathing','One hand on your chest, one on your belly. Breathe so only the belly hand rises.','q'],
  ['Physiological sigh','Two short breaths in through your nose, then one long sigh out through your mouth.','q'],
  ['Progressive muscle relaxation','Tense each muscle group for 5 seconds, then let it go, from your toes up to your face.','s'],
  ['Cold water reset','Splash cold water on your face or hold a cold pack to your cheeks for 30 seconds.','q'],
  ['Drop your shoulders','Notice your shoulders, jaw, and hands. Let each one soften on purpose.','q'],
  ['Hum or sing','Humming slows your breathing and calms your nervous system. Hum one song all the way through.','q'],
  ['Body scan','Lie down and move your attention slowly from head to toe, noticing without judging.','s'],
  ['Warm drink, slowly','Make tea or cocoa and drink it without your phone, noticing the warmth.','s'],
  ['Weighted blanket','Wrap up in a heavy blanket for a few minutes and let the pressure settle you.','s'],
  ['Counted breaths','Count each breath out from 1 to 10. If you lose count, start again at 1.','q']
 ],
 ground:[
  ['5-4-3-2-1','Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, and 1 you taste.','q'],
  ['Feet on the floor','Press your feet into the ground and notice the pressure, temperature, and texture.','q'],
  ['Name the room','Describe your surroundings out loud in detail: colors, shapes, what’s on the walls.','q'],
  ['Hold something cold or textured','Hold an ice cube, a smooth stone, or a fuzzy fabric and focus on the feeling.','q'],
  ['Category game','Pick a category (dog breeds, states, cereals) and name as many as you can.','q'],
  ['Scent anchor','Keep a favorite scent nearby (lotion, essential oil, coffee) and breathe it in slowly.','q'],
  ['Today’s facts','Say: my name is…, today is…, I am at…, I am safe right now.','q'],
  ['Count colors','Find everything blue in the room, then everything green, then everything red.','q'],
  ['Mindful eating','Eat one bite of food slowly. Notice its texture, taste, and smell.','q'],
  ['Trace your hand','Slowly trace the outline of your hand with one finger, breathing in up each finger and out down.','q'],
  ['Listen for layers','Close your eyes and notice the closest sound, then the farthest sound you can hear.','q'],
  ['Hold an object and describe it','Pick up anything nearby and describe it as if to someone who has never seen one.','q']
 ],
 move:[
  ['Walk it out','Take a 10-minute walk, even just around the building or the parking lot.','s'],
  ['Shake it off','Shake out your hands, arms, and legs for 30 seconds to release built-up tension.','q'],
  ['Stretch break','Reach overhead, roll your neck, touch your toes, and twist gently side to side.','q'],
  ['Dance to one song','Put on a song you love and move however feels good.','q'],
  ['Wall push-ups','Do 10 slow push-ups against a wall to burn off restless energy.','q'],
  ['Gentle yoga','Follow a short beginner yoga video or a few child’s poses and cat-cows.','s'],
  ['Climb stairs','Walk up and down a flight of stairs a few times.','q'],
  ['Stretch with the dogs','Take your pet for a walk and stretch while they sniff around.','s'],
  ['Bike ride','Ride for 15 to 30 minutes at an easy pace.','l'],
  ['Squeeze a stress ball','Squeeze hard for 5 seconds, release, and repeat 10 times.','q'],
  ['Tidy while moving','Put on music and tidy one area quickly for 10 minutes.','s'],
  ['Swim or soak','Swim laps or float in a pool and let the water hold you.','l'],
  ['Punch a pillow','Let out anger safely by punching a pillow or mattress.','q']
 ],
 think:[
  ['Fact, worry, or guess?','Write the stressful thought, then label it: is it a fact, a worry, or a guess?','q'],
  ['Talk to yourself like a friend','What would you say to a friend who had this exact thought? Say that to yourself.','q'],
  ['Thought record','Write the situation, your thought, the feeling, evidence for and against, and a balanced thought.','s'],
  ['Zoom out','Will this matter in 5 days? 5 months? 5 years?','q'],
  ['Best, worst, most likely','Write the best, worst, and most likely outcome. Plan only for the most likely.','s'],
  ['Name the thinking trap','Is it all-or-nothing, mind-reading, catastrophizing, or should-statements? Naming it loosens it.','q'],
  ['Worry time','Set aside 15 minutes later today for worrying. When a worry pops up, save it for then.','s'],
  ['Opposite action','When a feeling pushes you to do something unhelpful, gently do the opposite.','q'],
  ['What’s in my control?','Draw two circles: what you can control and what you can’t. Act only on the first.','s'],
  ['“And” instead of “but”','“I’m scared and I can do this.” Both things can be true at once.','q'],
  ['Find one thing that went right','Before bed, write one thing that went right today, however small.','q'],
  ['Self-compassion break','Say: this is hard, struggle is part of being human, may I be kind to myself.','q'],
  ['Accept the wave','Remind yourself feelings rise, peak, and pass, usually within 20 minutes.','q']
 ],
 feel:[
  ['Name it to tame it','Say the feeling out loud: “I’m feeling anxious.” Naming it lowers its intensity.','q'],
  ['Feelings wheel','Use a feelings wheel to find a more exact word than “bad” or “stressed.”','q'],
  ['Brain dump','Write everything in your head for 10 minutes without stopping or editing.','s'],
  ['Unsent letter','Write a letter to someone you’re upset with. You don’t have to send it.','s'],
  ['Let yourself cry','Crying releases stress hormones. Give yourself permission without judging it.','s'],
  ['Rate it 1–10','Rate the feeling’s intensity now, then check again in 15 minutes.','q'],
  ['Where is it in my body?','Notice where you feel the emotion physically and breathe into that spot.','q'],
  ['Voice memo vent','Record a voice memo saying everything you feel, then delete it if you want.','s'],
  ['Scream into a pillow','Let out the big feeling where no one has to hear it.','q'],
  ['Write the opposite story','Write how you’d feel if this went well. Let yourself picture it fully.','s'],
  ['Feel it for 90 seconds','Set a timer and let the feeling be there without fighting it.','q'],
  ['Comfort your younger self','Picture yourself as a kid going through this. What would you tell them?','s']
 ],
 connect:[
  ['Text a safe person','Send a simple message: “Rough day. Can you talk later?”','q'],
  ['Call instead of text','Hearing a familiar voice can calm you more than texting.','s'],
  ['Ask for specific help','Ask for one practical thing: a ride, a meal, someone to sit with you.','q'],
  ['Hug for 20 seconds','A long hug from someone you trust (or your pet) helps your body relax.','q'],
  ['Join a support group','Find an in-person or online group for what you’re going through.','l'],
  ['Talk to a counselor','Reach out to a therapist, counselor, or pastor you trust.','l'],
  ['Pet time','Sit with your dog or cat and focus on petting them slowly.','s'],
  ['Do something kind','Send a kind message or do a small favor for someone else.','q'],
  ['Be around people quietly','Go to a coffee shop or library. You don’t have to talk to anyone.','l'],
  ['Share one honest sentence','Tell someone one true thing about how you’re doing.','q'],
  ['Video call','See a friendly face. Video calls help when you can’t be together.','s'],
  ['Plan something together','Make a plan with someone, even a small one, so you have something to look forward to.','q']
 ],
 care:[
  ['Hot shower or bath','Let the warm water reset your body. Add music or a favorite soap.','s'],
  ['Comfort snack and water','Eat something and drink a glass of water. Hunger and thirst make everything harder.','q'],
  ['Nap or rest','Lie down for 20 minutes, even if you don’t sleep.','s'],
  ['Comfy clothes','Change into your softest clothes.','q'],
  ['Clean sheets','Put fresh sheets on your bed for a calm place to land tonight.','s'],
  ['Skincare or grooming','Wash your face, brush your hair, put on lotion slowly and with care.','s'],
  ['Comfort show or movie','Watch something familiar you know makes you feel good.','l'],
  ['Favorite meal','Cook or order a meal that reminds you of good times.','l'],
  ['Say no to one thing','Cancel or postpone one thing that isn’t necessary today.','q'],
  ['Screen break','Put your phone in another room for 30 minutes.','s'],
  ['Early bedtime','Go to bed an hour early with no screens.','l'],
  ['Comfort kit','Open a box with things that soothe you: a letter, a snack, a photo, a scent.','q'],
  ['Take your medications','Check that you’ve taken your medications and eaten today.','q']
 ],
 distract:[
  ['Puzzle or game','Do a crossword, word search, sudoku, or a simple phone game for 10 minutes.','s'],
  ['Read a few pages','Read a book or magazine you enjoy, even just a few pages.','s'],
  ['Funny videos','Watch something that makes you laugh.','s'],
  ['Clean one small thing','Wipe a counter, clear a drawer, or wash a few dishes.','q'],
  ['Count backward by 7s','Start at 100 and count backward by 7. It takes your full attention.','q'],
  ['Podcast or audiobook','Listen to something that pulls you into a different story.','l'],
  ['Organize something','Sort a drawer, your photos, or your playlist.','s'],
  ['Learn one new fact','Look up something you’ve always wondered about.','q'],
  ['Plan a dream trip','Look up a place you’d love to go and plan an imaginary day there.','s'],
  ['Change rooms','Physically move to a different room or space to break the loop.','q'],
  ['Make a playlist','Build a playlist for the mood you want to feel.','s'],
  ['Cook or bake','Follow a recipe step by step. It keeps your hands and mind busy.','l'],
  ['Window shop with no buying','Browse ideas for a future project without spending money.','s']
 ],
 create:[
  ['Doodle','Draw shapes, patterns, or anything at all for 5 minutes.','s'],
  ['Color','Use a coloring book or coloring app.','s'],
  ['Write a poem','Write a few lines about how you feel. It doesn’t have to rhyme.','s'],
  ['Journal prompt','Answer: “Right now I need…”','s'],
  ['Make music','Play an instrument, drum on a table, or make a beat.','s'],
  ['Craft project','Work on a craft like knitting, painting, woodwork, or a Dremel project.','l'],
  ['Collage','Cut out images and words from magazines that match how you want to feel.','l'],
  ['Photo walk','Take photos of 5 beautiful or interesting things nearby.','s'],
  ['Write a story','Write a short story where the main character gets through something hard.','l'],
  ['Rearrange a space','Move things around to make one corner feel new.','s'],
  ['Bake and share','Bake something and give some away.','l'],
  ['Make a vision board','Gather pictures of the life you’re building.','l']
 ],
 spirit:[
  ['Pray','Talk to God honestly about what you’re carrying.','q'],
  ['Read a favorite verse or passage','Read words that have comforted you before.','q'],
  ['Guided meditation','Follow a 5–10 minute guided meditation.','s'],
  ['Gratitude list','Write three things you’re grateful for right now.','q'],
  ['Worship music','Play music that lifts your spirit and sing along.','s'],
  ['Breath prayer','Pair a short phrase with your breath, like “Be still” on the in-breath and “and know” on the out.','q'],
  ['Visit a quiet place','Go to a church, chapel, or peaceful spot and sit for a while.','l'],
  ['Read your values','Look at what matters most to you and pick one small action that matches it.','q'],
  ['Serve someone','Volunteer or help a neighbor. Giving can shift your focus.','l'],
  ['Release it','Write the worry on paper, then fold it up or throw it away as a symbol of letting go.','q'],
  ['Loving-kindness','Silently wish well for yourself, someone you love, and someone you struggle with.','s'],
  ['Silence','Sit in complete silence for 5 minutes.','s']
 ],
 nature:[
  ['Step outside','Go outside and take 10 slow breaths of fresh air.','q'],
  ['Sunlight','Spend 10 minutes in sunlight, especially in the morning.','s'],
  ['Watch the sky','Look at clouds, a sunset, or the stars.','s'],
  ['Barefoot on grass','Stand barefoot on grass or sand and notice the ground under you.','q'],
  ['Tend a plant','Water a plant, pull a few weeds, or repot something.','s'],
  ['Listen to nature sounds','Play rain, ocean, or forest sounds if you can’t get outside.','s'],
  ['Walk in a park','Take a slow walk somewhere green.','l'],
  ['Go near water','Sit by a lake, river, fountain, or the ocean.','l'],
  ['Notice 3 living things','Find three living things outside: a bird, a tree, a bug.','q'],
  ['Open a window','Let in fresh air and outside sounds.','q'],
  ['Sit under a tree','Find a tree and rest in its shade for a while.','s'],
  ['Collect something','Pick up an interesting rock, leaf, or pinecone to keep as a reminder of calm.','s']
 ],
 organize:[
  ['Write a to-do list','Get every task out of your head and onto paper.','s'],
  ['Pick the one thing','Circle the one task that would make the biggest difference today.','q'],
  ['Break it down','Split an overwhelming task into the very first tiny step.','q'],
  ['Two-minute rule','If something takes under two minutes, do it now.','q'],
  ['Set a timer','Work on a task for 10 minutes only. You can stop when the timer rings.','s'],
  ['Plan tomorrow tonight','Write tomorrow’s top three tasks before bed.','s'],
  ['Check your money','Look at your account balance and upcoming bills so the unknown shrinks.','s'],
  ['Problem-solve on paper','Write the problem, three possible solutions, and pick one to try.','s'],
  ['Delegate one task','Ask someone else to take one thing off your plate.','q'],
  ['Clear your space','Clear just your desk, nightstand, or truck cab dashboard.','s'],
  ['Set a reminder','Put the thing you’re afraid of forgetting into a phone reminder.','q'],
  ['Lower the bar','Ask: what’s the “good enough” version of this?','q']
 ],
 go:[
  ['Grip the wheel or armrest','Feel the texture and pressure in your hands while you breathe slowly.','q'],
  ['Exhale at red lights','Every time you stop, take one long, slow breath out.','q'],
  ['Calm playlist','Keep a playlist ready that settles you down.','q'],
  ['Talk it out loud','Say what you’re feeling out loud in the car.','q'],
  ['Unclench','Check your jaw, shoulders, and grip, and relax each one.','q'],
  ['Restroom reset','Step away to a restroom for two minutes of breathing.','q'],
  ['Sip cold water','Drink slowly and notice the temperature.','q'],
  ['Name 3 things you see','Look up and name three things around you.','q'],
  ['Phone a friend at a stop','Make a quick call during a break or stop.','s'],
  ['Pocket stone','Keep a small smooth stone in your pocket to rub when stressed.','q'],
  ['Mantra','Repeat a short phrase like “One mile at a time” or “I can handle this moment.”','q'],
  ['Stretch at a stop','Get out, stretch your back and legs, and walk around for 5 minutes.','s'],
  ['Count your steps','Count steps as you walk to the next place, breathing in for 4 and out for 4.','q']
 ]
};

const YN=['Yes','No'], YSN=['Yes','Sometimes','No'];
export const BURN = [
 {t:'Responsibilities: what are you carrying?', s:'The people, work, and obligations pulling on your time and energy.', q:[
  ['h','Family & household'],
  ['house','What is your current household situation?','one',['Live alone','Partner/spouse','Roommates','Family','Other']],
  ['kids','Do you have children you are responsible for?','one',YN],
  ['kidsn','How many?','num'],
  ['care','Are you caring for an aging parent, disabled family member, partner, or another person?','one',YN],
  ['dep','How many people regularly depend on you for physical, emotional, or financial support?','num'],
  ['hw','How much of the household work are you responsible for?','one',['Very little','Some','About half','Most','Nearly all']],
  ['share','Are there household responsibilities you believe should be shared more evenly?','one',YN],
  ['h','Work'],
  ['jobs','How many jobs do you currently have?','num'],
  ['hrs','About how many hours do you work each week?','num'],
  ['comm','About how many hours do you spend commuting each week?','num'],
  ['enjoy','Do you generally enjoy your work?','one',['Usually','Sometimes','Rarely','Never']],
  ['wstress','How stressful does work feel most weeks?','scale'],
  ['ot','Do you regularly work overtime?','one',YSN],
  ['breaks','Are you able to take your scheduled breaks?','one',['Usually','Sometimes','Rarely']],
  ['after','Are you expected to answer calls, messages, or emails outside working hours?','one',YSN],
  ['staff','Do you feel adequately staffed and supported at work?','one',YSN],
  ['ctl','How much control do you have over your workload and schedule?','one',['A lot','Some','Very little','None']],
  ['h','School & other commitments'],
  ['schoolh','Hours per week for school, training, or certification courses (0 if none)','num'],
  ['comh','Hours per week for volunteer, religious, community, sports, music, or other commitments','num'],
  ['comf','Do these activities generally…','one',['Give me energy','Use energy but feel worthwhile','Feel mostly like obligations']]]},
 {t:'Financial pressure & basic needs', s:'Money and material stability shape everything else on this list.', q:[
  ['worry','How often do you worry about money?','one',['Rarely','Sometimes','Often','Nearly every day']],
  ['bills','Are you able to pay your essential bills?','one',['Comfortably','With difficulty','Not consistently']],
  ['debt','Are debt or overdue bills causing significant stress?','one',YN],
  ['morehrs','Do financial needs cause you to work more hours than you can comfortably handle?','one',YN],
  ['notime','Have money concerns kept you from taking needed time off?','one',YN],
  ['food','Do you consistently have enough food available?','one',['Yes','Usually','Sometimes not','Frequently not']],
  ['skip','Have you skipped meals or eaten less because food was unavailable or unaffordable?','one',YN],
  ['nutr','Can you generally afford foods that meet your nutritional and dietary needs?','one',YSN],
  ['access','Do you have reliable access to housing, transportation, medications, hygiene products, and other necessities?','one',['Yes','Mostly','No']],
  ['moneyq','Which financial or basic-needs issue is creating the most stress right now?','text']]},
 {t:'Rest & recovery', s:'Not just time off, but whether that time actually restores you.', q:[
  ['vac','When did you last take a vacation or several days away from your normal responsibilities?','text'],
  ['dayoff','When did you last take a full day off work?','text'],
  ['freeday','When did you last have a whole day without significant work, school, caregiving, or household obligations?','text'],
  ['own','How many hours each week are genuinely your own time?','num'],
  ['relax','How often do you have time to relax without needing to accomplish something?','one',['Daily','Several times a week','Weekly','Rarely','Almost never']],
  ['canrelax','When you have free time, can you actually relax?','one',['Usually','Sometimes','Rarely']],
  ['guilt','Do you feel guilty when you’re resting?','one',['Often','Sometimes','Rarely','Never']],
  ['restored','After a day off, do you generally feel restored?','one',['Yes','Somewhat','No']],
  ['living','Does your time off feel like living your life, or mainly recovering enough to go back to your responsibilities?','text']]},
 {t:'Sleep & physical recovery', s:'Your body keeps its own record, whether you’re paying attention or not.', q:[
  ['sleep','How many hours do you usually sleep each night?','num'],
  ['rested','Do you usually wake up feeling rested?','one',['Yes','Sometimes','Rarely']],
  ['interf','Do responsibilities regularly interfere with getting enough sleep?','one',YSN],
  ['sacr','Do you regularly sacrifice sleep to finish tasks or get personal time?','one',YSN],
  ['exh','Does your work, caregiving, or daily routine leave you physically exhausted?','one',['Often','Sometimes','Rarely']],
  ['pbreak','Do you have chances to eat, drink, sit down, and take physical breaks during your day?','one',YSN]]},
 {t:'Relationships & support', s:'Who’s actually there for you, and who you’re carrying instead.', q:[
  ['meet','How often do you spend meaningful time with people you enjoy?','one',['Several times a week','Weekly','Occasionally','Rarely']],
  ['supp','Do you have family or friends you consider genuinely supportive?','one',['Yes','Somewhat','No']],
  ['talk','Do you have someone you can talk to when you’re overwhelmed?','one',YN],
  ['prac','Do you have someone you can ask for practical help, not just emotional support?','one',YN],
  ['recv','When you ask for help, do you generally receive it?','one',['Yes','Sometimes','Rarely']],
  ['leave','Your closest relationships generally leave you feeling…','one',['Supported/recharged','Neutral','Drained/stressed']],
  ['lonely','Do you regularly feel lonely or isolated?','one',YSN],
  ['carry','Are you carrying another person’s emotional needs while struggling to meet your own?','one',YSN]]},
 {t:'Mental & emotional load', s:'The invisible work of remembering, anticipating, and managing it all.', q:[
  ['remember','Are you usually the one who remembers appointments, bills, schedules, groceries, birthdays, medications, and household tasks?','one',['Yes','Partially','No']],
  ['solve','Do other people often rely on you to solve problems?','one',YSN],
  ['antic','Do you spend a lot of time anticipating what other people will need?','one',YSN],
  ['running','Does your mind keep running through responsibilities even when you’re resting?','one',['Often','Sometimes','Rarely']],
  ['forget','How often do you feel like you’re forgetting something important?','one',['Often','Sometimes','Rarely']],
  ['keep','Do you feel responsible for keeping things running for everyone else?','one',YSN],
  ['occupy','What responsibilities occupy your thoughts the most?','text']]},
 {t:'Boundaries & control', s:'How much say you actually have in your own day-to-day life.', q:[
  ['no','How comfortable are you saying no when you don’t have the capacity?','one',['Very comfortable','Somewhat comfortable','Difficult','Extremely difficult']],
  ['agree','Do you regularly agree to things you don’t have time or energy for?','one',YSN],
  ['respect','Do people generally respect your boundaries?','one',YSN],
  ['disap','Do you feel guilty disappointing other people?','one',['Often','Sometimes','Rarely']],
  ['control','How much control do you feel you have over your daily life?','scale'],
  ['disrupt','How often are your plans disrupted by emergencies or other people’s needs?','one',['Frequently','Sometimes','Rarely']],
  ['oblig','Is there anything you keep doing mainly because you feel obligated to?','text']]},
 {t:'Enjoyment, connection & meaning', s:'What’s left in your life that’s just for you.', q:[
  ['joy','How often do you do something simply because you enjoy it?','one',['Daily','Several times a week','Weekly','Rarely','Never']],
  ['hobby','Do you have hobbies that aren’t connected to work, money, caregiving, or productivity?','one',YN],
  ['stopped','Have you stopped doing things you used to enjoy because you’re too tired, busy, or overwhelmed?','one',YN],
  ['forward','Do you regularly have something to look forward to?','one',['Yes','Sometimes','Rarely']],
  ['meaning','Do the things taking most of your time feel meaningful to you?','one',['Mostly','Somewhat','Rarely']],
  ['miss','What is something you miss doing?','text']]},
 {t:'Recent changes & added stress', s:'Change costs energy, even when it’s change you chose.', q:[
  ['changes','In the past year, have you experienced any of these?','many',['Move/housing change','Job change or job loss','Financial crisis','Relationship change','Death or significant loss','New child or caregiving responsibility','Significant illness or injury (you or someone close)','Starting or returning to school','Major conflict','Legal problems','Other big life change']],
  ['adjust','Do you feel you’ve had enough time to adjust or recover from them?','one',['Yes','Somewhat','No']]]},
 {t:'Finding the pressure point', s:'Where everything above actually comes together.', q:[
  ['top3','Which three areas above are taking the most energy?','many',['Responsibilities','Work','Money & basic needs','Rest','Sleep','Relationships','Mental load','Boundaries','Enjoyment','Recent changes']],
  ['hardest','Which responsibility feels hardest to carry right now?','text'],
  ['reduce','Which responsibility could realistically be reduced, shared, postponed, or dropped?','text'],
  ['needmore','What do you need more of right now?','many',['Sleep','Time','Money','Food/resources','Practical help','Emotional support','Solitude','Social connection','Enjoyment','Control over my schedule']],
  ['disappear','If one source of stress disappeared tomorrow, which would improve your life the most?','text'],
  ['ten','What would make your life 10% easier this week?','text'],
  ['askhelp','What is one thing you could ask someone else to help carry?','text'],
  ['perfect','What is one responsibility that doesn’t need to be done perfectly?','text']]}
];

export const SLEEP_FACTORS=['Caffeine after noon','Screens in bed','Exercise today','Stress or worry','Late meal','Alcohol','Napped','Read before bed','Kept my routine','Pain or discomfort','Noise or light','Pets woke me'];
export const MEALS=['Breakfast','Lunch','Dinner','Snacks'], WEEK=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
export const AISLES=['Produce','Meat & protein','Dairy & eggs','Bakery','Pantry','Frozen','Drinks','Household','Pets','Other'];
export const TRAPS=[['All-or-nothing','Seeing things as all good or all bad, with no middle.'],['Catastrophizing','Jumping to the worst possible outcome.'],['Mind reading','Assuming you know what others think.'],['Fortune telling','Predicting things will go badly.'],['Should statements','Rigid rules like “I should” or “I must.”'],['Labeling','Calling yourself a name instead of describing what happened.'],['Overgeneralizing','“This always happens” from one event.'],['Mental filter','Only noticing the negative.'],['Discounting the positive','“That doesn’t count.”'],['Emotional reasoning','“I feel it, so it must be true.”'],['Personalizing','Blaming yourself for things outside your control.'],['Blaming','Putting all responsibility on someone else.']];
export const STARTERS=['What’s something I did recently that made you feel loved?','What’s one thing you’re looking forward to this month?','What’s a dream you haven’t told me much about?','When do you feel most connected to me?','What’s stressing you out that I might not know about?','What’s a favorite memory of us from this year?','How can I support you better this week?','What’s something new you’d like us to try together?','What did your family do well that you’d like us to do too?','What’s one thing you’d like more of in our relationship?','What does a perfect lazy day together look like to you?','What are you proud of yourself for lately?','Where do you want us to be in five years?','What’s a small habit of mine you secretly love?','Is there anything you’ve wanted to say but haven’t?','What made you laugh this week?','What’s a place you want us to visit together?','How do you like to be comforted when you’re upset?','What tradition would you like us to start?','What’s one thing we could do this week to feel closer?'];
export const LOVE=['Words of affirmation','Quality time','Acts of service','Gifts','Physical touch'];
export const VALUES=['Faith','Family','Freedom','Health','Honesty','Kindness','Growth','Adventure','Security','Creativity','Service','Independence','Peace','Courage','Loyalty','Learning','Community','Gratitude','Balance','Purpose'];
// Worksheets still to come. All seven earlier ones are built now (see more.js).
export const SOON=[];
